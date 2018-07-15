# String

*  对于JDK中String类，由于其被final修饰，意味着其在后续使用过程中不可改变也不可继承；
*  String其最原始数据结构是System.char[],由于其被修饰为final，意味着其一旦被初始化将不能改变；保证String对象不可变的特性；（这个也是String、StringBuilder、StringBuffer最大的区别）

## 不可变性

* String对象是不可变的，String类中每一个看起来会修改String值的方法，实际上都是创建一个全新的String对象，以包含修改后的字符串内容，而最初的String对象则丝毫未动；
