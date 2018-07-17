# 设计原则

## 单一职责原则(Single Responsibility Principle)

在程序开发设计阶段,对接口或者类,应该有且仅有一个原因引起类的变更;说白了就是单一!

> 优势:
* 类的复杂性降低,实现什么职责都有清晰明确的定义;
* 可读性提高;
* 可维护性提高;
* 变更引起的风险降低;

> 劣势:
* 职责划分的困难
* 职责划分粒度,过细带来类爆炸

## 里氏替换原则(LiskovSubstitution Principle)

所有引用基类的地方必须能透明地使用其子类的对象;

> 优势:
* 代码共享,减少创建类的工作量;
* 提高代码的重用性;
* 子类形似父类,又异于父类;
* 可扩展性提高;

> 劣势:

## 依赖倒置原则(Dependence Inversion Principle)

> 
* 高层模块不应该依赖低层模块,两者都应该依赖其抽象
* 抽象不应该依赖细节
* 细节应该依赖抽象

## 接口隔离原则(Interface Segregation Principle)

## 最少知识原则(Least Knowledge Principle)

## 开闭原则(Open Closed Priniciple)

软件实体应该对扩展开放,对修改关闭;
