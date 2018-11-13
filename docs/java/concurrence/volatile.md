# volatile

## volatile的特性

理解volatile特性的一个好方法是把对volatile变量的单个读/写，看成是使用同一个锁对这些单个读/写操作做了同步

***（锁的happens-before规则保证释放锁和获取锁的两个线程之间的内存可见性，这意味着对一个volatile变量的读，总是能看到（任意线程）对这个volatile变量最后的写入）***

>volatile变量自身具有下列特性：
* 可见性，对一个volatile变量的读，总是能看到（任意线程）对这个volatile变量最后的写入
* 原子性，对任意单个volatile变量的读/写具有原子性，但类似于volatile++这种复合操作不具有原子性

## volatile写-读建立的happens-before关系

从JSR-133开始（即从JDK5开始），volatile变量的写-读可以实现线程之间的通信。

>从内存语义的角度来说，volatile的写-读于锁的释放-获取有相同的内存效果：
* volatile写和锁的释放有相同的内存语义；
* volatile读与锁的获取有相同的内存语义；

## volatile写-读的内存语义

>volatile写的内存语义：
* 当写一个volatile变量时， JMM会把该线程对应的本地内存中的共享变量值刷新到主内存；

>volatile读的内存语义：
* 当读一个volatile变量是， JMM会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量；

## volatile内存语义的实现

为了实现volatile内存语义，JMM会分别限制编译器重排序和处理器重排序。
为了实现volatile的内存语义，编译器在生成字节码时，会在指令序列中插入内存屏障来禁止特定类型的处理器重排序。
>对于编译器来说，发现一个最优布置来最小化插入屏障的总数几乎不可能，为此，JMM采取保守策略：
* 在每个volatile写操作的前面插入一个StoreStore屏障；
* 在每个volatile写操作的后面插入一个StoreLoad屏障；
* 在每个volatile读操作的后面插入一个LoadLoad屏障；
* 在每个volatile读操作的后面插入一个LoadStore屏障；

## JSR-133 为什么要增强volatile的内存语义

在旧的内存模型中，volatile的写-读没有锁的释放-获取所具有的内存语义。为了提供一种比锁更轻量级的线程之间通信的机制，JSR-133增强了volatile的内存语义：
>* 严格限制编译器和处理器对volatile变量与普通变量的重排序，确保volatile的写-读和锁的释放-获取具有相同内存语义；
* 由于volatile仅仅保证对单个volatile变量的读/写具有原子性，而锁的互斥执行的特性可以确保对整个临界区代码的执行具有原子性。
  * 在功能上，锁比volatile更强大； 
  * 在可伸缩性和执行性能上，volatile更有优势；