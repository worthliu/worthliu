# 锁

## 锁的释放-获取建立的happens-before关系

锁是java并发编程中最重要的同步机制，锁除了让临界区互斥执行外，还可以让释放锁的线程向获取同一个锁的线程发送消息；

## 锁释放和获取的内存语义

>* 当线程释放锁时，JMM会把该线程对应的本地内存中的共享变量刷新到主内存中。
* 当线程获取锁时，JMM会把该线程对应的本地内存置为无效。从而使得被监视器保护的临界区必须要从主内存中去读取共享变量。

***（对比锁释放-获取的内存语义与volatile写-读的内存语义，两者具有相同的内存语义）***

## 锁内存语义的实现

JDk中锁实现有两种：
>* `synchronized`，编译器通过在编译字节码时，在临界区添加内存屏障，交由JVM控制；
* `ReentrantLock`,可重入锁,调用`lock()`方法获取锁;调用`unlock()`方法释放锁;
  * `ReentrantLock`的实现依赖于Java同步器框架`AbstractQueuedSynchronizer`(AQS).AQS使用一个整型的`volatile`变量(命名为`state`)来维护同步状态;

ReentrantLock分为公平锁和非公平锁:
>* 使用公平锁时,加锁方法`lock()`的方法调用轨迹如下:
  1. `ReentrantLock:lock()`
  2. `FairSync:lock()`
  3. `AbstractQueuedSynchronizer:accquire(int arg)`
  4. `ReentrantLock:tryAcquire(int acquires)`
![tryAcquire](/images/tryAcquire.png)

>* 使用公平锁时,解锁方法`unlock()`的方法调用轨迹如下:
  1. `ReentrantLock:unlock()`
  2. `AbstractQueuedSychronizer:release(int arg)`
  3. `Sync:tryRelease(int releases)`
![tryRelease](/images/tryRelease.png)

(公平锁在释放锁的最后写`volatile`变量`state`;
 在获取锁时首先读这个volatile变量.**根据volatile的happens-before规则,释放锁的线程在写volatile变量之前可见的共享变量,在获取锁的线程读取同一个volatile变量后将立即变的对获取锁的线程可见**)

>* 使用非公平锁时,加锁方法lock()的方法调用轨迹如下:
  1. `ReentrantLock:lock()`
  2. `NonfairSync:lock()`
  3. `AbstractQueuedSynchronizer:compareAndSetState(int expect, int update)`
![compareAndSwapInt](/images/compareAndSwapInt.png) 

>* 编译器不会对`volatile`读与`volatile`读后面的任意内存操作重排序;
* 编译器不会对`volatile`写与`volatile`写前面的任意内存操作重排序;

**(为了同时是实现`volatile`读和`volatile`写的内存语义,编译器不能对CAS与CAS前面和后面的任意内存操作重排序)**

![casSource](/images/casSource.png)


>如源代码所示,程序会根据当前处理器的类型来决定是否为cmpxchg指令添加lock前缀.如果程序时在多处理器上运行,就为cmpxchg指令加上lock前缀(lock cmpxchg).反之,不需要lock前缀提供的内存屏障效果.

>Intel的手册对lock前缀的说明:
1. 确保对内存的读-改-写操作源自执行.*在Pentium及Pentium之前的处理器中,带有lock前缀的指令在执行期间会锁住总线,使得其他处理器暂时无法通过总线访问内存.
  * 从Pentium 4 ,Intel Xeon及P6处理器开始,Intel在原有总线锁的基础上做了一个很有意义的优化:如果要访问的内存区域在lock前缀指令执行期间已经在处理器内部的缓存中被锁定(即包含改内存区域的缓存行当前处于独占或以修改状态),并且该内存被完成包含在单个缓存行中,那么处理器将直接执行该指令.
  * **由于在指令执行期间该缓存行一直被锁定,其他处理器无法读/写该指令要访问的内存区域,因此能保证指令执行的原子性.**缓存锁定将大大降低lock前缀指令的执行开销,但是当多处理器之间的竞争程度很高或者指令访问的内存地址未对齐时,仍然会锁住总线;
2. 禁止该指令与之前和之后的读和写指令重排序;
3. 把写缓冲区中所有数据刷新到内存中;

---

>公平锁和非公平锁的内存语义总结:
1. 公平锁和非公平锁释放时,最后都要写一个`volatile`变量state;
2. 公平锁获取是,首先去读这个`volatile`变量;
3. 非公平锁获取时,首先会用CAS更新这个`volatile`变量,这个操作同时具有`volatile`读和`volatile`写的内存语义;

## concurrent包的实现

由于Java的CAS同时具有volatile读和volatile写的内存语义,因此Java线程之间的通信现在有了下面四种方式:
>1. A线程写volatile变量,随后B线程读这个volatile变量;
2. A线程写volatile变量,随后B线程用CAS更新这个volatile变量;
3. A线程用CAS更新一个volatile变量,随后B线程用CAS更新这个volatile变量;
4. A线程用CAS更新一个volatile变量,随后B线程读这个volatile变量;

***Java的CAS会使用现代处理器上提供的高效机器级别原子指令,这些原子指令以原子方式对内存执行读-改-写操作,只是在多处理器中实现同步的关键来说,能够支持原子性读-改-写指令的计算器,是顺序计算图灵机的异步等价机器;***

同时,volatile变量的读/写和CAS可以实现线程之间的通信.这形成呢整个concurrent包得以实现的基石.
>concurrent包的源代码实现,会发现一个通用化的实现模式:
1. 首先,声明共享变量为volatile;
2. 然后,使用CAS的原子条件更新来实现线程之间的同步;
3. 同时配合以volatile的读/写和CAS所具有的volatile读和写的内存语义来实现线程之间的通信;

>AQS,非阻塞数据结构和原子变量类(`java.util.concurrent.atomic`包中的类)

![cas](/images/cas.png)