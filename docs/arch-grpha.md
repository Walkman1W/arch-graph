
---

## 一、方法名称（草案）

**一种用于 BIM 模型语义到空间图数据库的语言映射方法及系统**

---

## 二、总体思路（一句话）

核心是先建立一个**“空间语言本体（Space Language Ontology）”**，把 BIM 里的构件/楼层/房间/管线等，统一映射到 *空间节点 + 关系边 + 空间句法谓词*，然后再把这些谓词与 Cypher 查询模板一一对应，实现：

* 「每层有哪些空间？」→ 空间分类 + 聚合查询
* 「去到一楼电房如何走？」→ 空间路径查询（shortestPath）
* 「这一根管穿过哪些空间？」→ 几何交集 → 空间交叉关系查询

---

## 三、语义分层模型（发明点 1）

### 3.1 语义层级

定义五层统一语义层：

1. **构件层 Element Layer**

   * BIM 实体（墙、门、机电设备、管线等）
2. **空间层 Space Layer**

   * 房间、区域、核心筒、竖井、机房、走廊、楼梯间等
3. **结构层 Structure Layer**

   * 建筑、单体、楼层、专业系统（HVAC、电气、消防、给排水）
4. **拓扑层 Topology Layer**

   * 空间邻接、包含、连通、可达路径、上下层连接等
5. **空间语言层 Space Language Layer**

   * 一组可组合的“空间动词 / 谓词”，如：

     * `LocatedIn(x, Space)`：位于某空间
     * `AdjacentTo(SpaceA, SpaceB)`：相邻
     * `Connects(SpaceA, SpaceB)`：可通行连接
     * `Crosses(Element, Space)`：元素穿越空间
     * `Serves(Element, Space)`：服务空间（机电终端）
     * `OnLevel(Space, Level)`：所在楼层
     * `BelongsToSystem(Element, System)`：所属系统

**发明点：**
把 BIM 中杂乱的实体/关系，**先归一到一套「空间语言谓词集合」**，这套谓词既能被 LLM 理解，又能被图数据库执行（后面一一映射到 Cypher 模板）。

---

## 四、图数据库语言映射模型（发明点 2）

### 4.1 节点类型映射

从 BIM 中抽取以下实体，映射为 Neo4j 节点（仅列关键）：

* `:Building`  建筑
* `:Storey`     楼层
* `:Zone`       区域（消防分区、功能分区）
* `:Space`      房间、走廊、机房、竖井等
* `:Element`    构件（墙、门、梁、柱）
* `:MEPSystem`  机电系统（风系统、电气回路、消防系统）
* `:MEPElement` 机电设备、管线、风管、桥架等
* `:Opening`    门、窗、洞口
* `:RouteNode`  路径节点（门洞中心、楼梯口、竖井入口等抽象点）
* `:RouteEdge`  路径边（可通行线段，可选）

每个节点带有统一属性集合，例如：

```text
globalId      – BIM 全局 ID
source        – 来源模型（Revit/IFC/其它）
category      – Revit Category / IFC Type
bbox          – 包围盒几何（最小外界坐标）
solidHash     – 几何指纹（可选）
levelCode     – 楼层编码
systemCode    – 系统编码
tags[]        – 语义标签（“电房”“弱电”“走道” 等）
```

### 4.2 关系类型映射

定义一组标准边类型，用来承载前述空间语言谓词：

* `(:Space)-[:ON_LEVEL]->(:Storey)`
* `(:Space)-[:IN_BUILDING]->(:Building)`
* `(:Space)-[:IN_ZONE]->(:Zone)`
* `(:Space)-[:ADJACENT_TO]->(:Space)`
* `(:RouteNode)-[:CONNECTS_TO {weight, type}]->(:RouteNode)`
* `(:Element)-[:LOCATED_IN]->(:Space)`
* `(:MEPElement)-[:CROSSES]->(:Space)` （几何穿越）
* `(:MEPElement)-[:BELONGS_TO_SYSTEM]->(:MEPSystem)`
* `(:Opening)-[:CONNECTS_SPACE]->(:Space)`（门洞双向连接两个空间）

**发明点：**
空间语言谓词 ⇋ 图数据库边类型 **一一对应**，后续 LLM 只需要在谓词层规划逻辑，底层即可自动装配 Cypher 语句。

---

## 五、BIM → 空间图的映射算法（核心算法）

下面写成“步骤 + 伪代码”的形式，你可以直接塞进“具体实施方式”。

### 5.1 几何预处理

**步骤 A1：几何与语义抽取**

1. 从 BIM 模型中导出 IFC / Revit 数据（通过 Speckle、IFC 导出或 Revit API）。
2. 对每个构件计算：

   * 几何表示（BRep / Mesh）
   * 包围盒 `bbox`
   * 所属楼层、类别、系统等语义属性。
3. 对空间类对象（房间、区域、竖井、机房）生成体素或 BRep。

```pseudo
for each bimElement in BIM_Model:
    geom = extractGeometry(bimElement)
    attrs = extractAttributes(bimElement)
    store TempElement{ id, geom, bbox, attrs }
```

### 5.2 空间识别与分层

**步骤 A2：空间实体归一**

1. 将 Revit/IFC 中的 `Room/Space/Zone/Storey` 等统一映射为 `Space` 或 `Zone` 等节点类型。
2. 根据楼层信息创建 `Storey` 节点，并建立 `Space-ON_LEVEL-Storey` 关系。

```pseudo
for each room in BIM_Rooms:
    createNode(:Space {globalId, levelCode, tags})
    linkToStorey(space, levelCode)
```

### 5.3 空间拓扑构建（邻接 + 路径）

**步骤 A3：空间邻接计算**

1. 对所有空间体 `Si`、`Sj` 计算边界接触情况：

   * 如果两个空间的边界面存在共面/共线并达到一定面积阈值，则建立 `ADJACENT_TO` 关系。

简单判定公式示意：

* 设 `Face_i`、`Face_j` 为两空间相对的面，
  其交集面积 `Area_intersect(Face_i, Face_j)` 满足：

[
\frac{Area_\text{intersect}}{\min(Area_i, Area_j)} > \tau_a
]

则记为相邻，其中 `τ_a` 为预设阈值（如 0.2）。

2. 对每个门洞（Opening）找到其两侧空间，建立：

```text
(:Opening)-[:CONNECTS_SPACE]->(:Space)
(:Space)-[:ADJACENT_TO {via: Opening}]->(:Space)
```

**步骤 A4：行走路径图构建**

1. 在走廊中心线、门洞中心点、楼梯起止点等位置生成 `RouteNode`。
2. 按可通行性生成 `CONNECTS_TO` 边，并计算长度、坡度、是否楼梯等属性，作为边权重。

```pseudo
for each corridorCenterline:
    sample points -> RouteNode[]
    connect consecutive nodes with CONNECTS_TO(weight = length)

for each doorOpening:
    create or reuse RouteNode at door center
    link to adjacent corridor / room RouteNode
```

这样，“去到一楼电房如何走？”就变成：
在 `Storey=1` 中，从当前 `Space` 对应的 `RouteNode` 到 “电房 Space 对应 RouteNode” 的最短路径。

### 5.4 构件 – 空间关系（管线穿越空间）

**步骤 A5：几何交集判定**

1. 对所有 MEP 管线、风管等 `MEPElement`，与空间体 `Space` 做几何相交。
2. 计算交集体积 `V_intersect`，当：

[
\frac{V_\text{intersect}}{V_\text{MEPElement}} > \tau_c
]

则认为该构件穿过该空间，并生成：

```text
(:MEPElement)-[:CROSSES]->(:Space)
```

3. 当交集长度或比例小于阈值但端头落在空间内部时，可标记为 `Serves` 关系：

```text
(:MEPElement)-[:SERVES]->(:Space)
```

---

## 六、空间语言 → Cypher 查询模板映射（发明点 3）

这部分就是“语言映射算法”的关键：**把自然语言问题先转成「空间语言谓词表达式」，再映射成 Cypher 模板**。

### 6.1 空间语言中间表示

定义一种中间 DSL（只是概念，不一定真的实现成语言）：

```text
Query 1: 每层有哪些空间？
⇒ FOR level in Storey:
       RETURN Spaces( OnLevel(Space, level) )

Query 2: 去到一楼电房如何走？
⇒ FindPath(
       from = CurrentSpace,
       to   = Space{tag = '电房', level = 1},
       graph = RouteGraph
   )

Query 3: 这一根管穿过哪些空间？
⇒ Spaces( Crosses(MEPElement{id = X}, Space) )
```

### 6.2 DSL → Cypher 模板

给出几条核心映射规则（可作为“算法规则表”写进专利）：

1. **空间枚举**

```cypher
MATCH (s:Storey)<-[:ON_LEVEL]-(sp:Space)
RETURN s.name AS level, collect(sp.name) AS spaces
ORDER BY s.elevation;
```

2. **路径查询**

```cypher
MATCH (startSpace:Space {globalId: $startId})-[:HAS_ROUTE_NODE]->(start:RouteNode),
      (endSpace:Space   {tag: '电房', levelCode: '1F'})-[:HAS_ROUTE_NODE]->(end:RouteNode),
      p = shortestPath( (start)-[:CONNECTS_TO*..50]->(end) )
RETURN p;
```

3. **管线穿越空间**

```cypher
MATCH (pipe:MEPElement {globalId: $pipeId})-[:CROSSES]->(sp:Space)
RETURN sp;
```

**算法要点：**

* LLM 只负责把自然语言解析成上述 DSL（或直接识别出谓词 + 参数）。
* 映射模块根据 DSL **模式匹配**到对应的 Cypher 模板，并填入参数（楼层名、空间标签、构件 ID 等）。
* 这块可以写成“规则库 + 模板匹配算法”（例如：按谓词组合匹配优先级）。

---

## 七、增量更新算法（可做一个从属权利要求）

为了保证模型变化后图数据库仍然正确，给一个简单的增量更新策略：

1. 对 BIM 模型变更生成 `ChangeSet`（新增/删除/修改的构件 ID）。
2. 对 `ChangeSet` 中的构件：

   * 如果是空间类对象：重算邻接、路径节点、ON_LEVEL 等关系。
   * 如果是 MEP 元素：只对其附近空间做局部几何交集重算。
3. 使用 **幂等 Upsert** 方式更新节点/边（`MERGE` + 属性更新）。

```cypher
UNWIND $changedSpaces AS spData
MERGE (sp:Space {globalId: spData.id})
SET sp += spData.props;
```

---

## 八、可以写进“权利要求”的几个点（草稿级，要你后面润色）

1. **权 1（方法总框架）**

   * 一种用于 BIM 模型语义到空间图数据库的语言映射方法，
     包括：
     1）从 BIM 模型中抽取几何与语义信息，构建构件层、空间层、结构层；
     2）依据几何邻接与门洞连接关系构建空间拓扑层及路径图；
     3）定义空间语言层的谓词集合，并将其与图数据库节点和关系类型建立对应；
     4）将自然语言查询解析为空间语言中间表示，并据此生成图数据库查询语句。

2. **权 2（几何交叉 + 管线穿越）**

   * 如权 1 所述方法，其中通过计算机电构件几何与空间体的交集体积比例，
     当比例大于预设阈值时，生成机电构件到空间的 `CROSSES` 关系边，用于表示构件穿越空间。

3. **权 3（路径查询映射）**

   * 如权 1 所述方法，其中对于“从起始空间到目标空间的路径”查询，
     在空间语言层中表示为 `FindPath(CurrentSpace, TargetSpace)`，
     映射为图数据库中以 `RouteNode` 为节点的最短路径查询语句。

---

## 九、怎么用到你现在的场景

* UI 左侧 Speckle 轻量化模型 + Neo4j 空间图（上/下分屏）；
* 右侧对话框，LLM 做两件事：

  1. 把用户问句 → DSL（空间语言谓词 + 参数）；
  2. 根据模板规则生成 Cypher，查询 Neo4j，返回结果，再转成自然语言 + 高亮模型对象。

对应你说的三个典型问题：

1. **“分析一下该建筑模型每层分别有哪些空间？”**

   * DSL：`ListSpacesByLevel()`
   * Cypher：空间枚举 + Group by Storey
2. **“去到一楼电房如何走？”**

   * DSL：`FindPath(CurrentSpace, Space{tag='电房', level='1F'})`
   * Cypher：`shortestPath` over `RouteNode` graph
3. **“这一根管穿过哪些空间？”**

   * DSL：`Spaces( Crosses(Pipe{id=X}, Space) )`
   * Cypher：`MATCH (pipe)-[:CROSSES]->(sp:Space)`

---