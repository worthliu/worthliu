# 线程
**线程是一个操作系统级别的概念。**
JAVA语言（包括其他编程语言）本身不创建线程；而是调用操作系统层提供的接口创建、控制、销毁线程实例。并且根据操作系统使用线程的进程的不一样，线程还分为用户线程和操作系统线程。
>+ ***操作系统线程（内核线程）***，是指操作系统内核为了完成硬件接口层操作，由操作系统内核创建的线程：例如I/O操作的内核线程，这些线程应用程序是不能干预的；
+ ***用户线程***，是指用户安装/管理的应用程序，为执行某一种操作，而由这个应用程序创建的线程;

## 线程状态

![image](/images/threadstatus.png)

>1. **创建**：当线程被创建时，它只会短暂地处于这种状态。此时它已经*分配了必需的系统资源，并执行了初始化*。
2. **就绪**：在这种状态下，只需*CPU调度分配时间片*给线程，线程就可以执行；
3. **阻塞**：线程能够运行，但有某个条件阻止它的运行。当线程处于阻塞状态时，调度器将忽略线程，*不会分配给线程任何CPU时间*；
4. **执行**：线程获取CPU时间，正在运行中；
5. **死亡**：处于死亡或终止状态的线程将不再是可调度的，并且再也不会得到CPU时间，它的任务已结束，或不再是可运行的；

---
## Java的线程机制

**Java的线程机制:**
>* 由执行程序表示的单一进程中创建工作任务(既是工作线程);
* 线程工作时间时抢占式的（抢占的对象是**系统CPU时间**），调度机制会周期性地中断线程，将上下文切换到另一个线程，从而为每个线程都提供时间片，使得每个线程都会分配到数量合理的时间去驱动它的任务；

并发编程使我们可以将程序划分为多个分离的、独立运行的任务。

通过使用多线程机制，这些独立任务中的每一个都将由执行线程来驱动；一个线程就是在进程中的一个单一顺序控制流一样。其底层机制是切分CPU时间，但通常你不需要考虑它。线程模型为编程带来了便利，它简化了在单一程序中同时交织在一起的多个操作的处理；

在使用线程时，CPU将轮流给每个任务分配其占用时间。每个任务都觉得子集在一直占用CPU，但事实上CPU时间是划分称片段分配给了所有的任务；


>* 线程可以驱动任务，可以由Runable接口来提供;
* 要定义任务，只需实现`Runable`接口并编写`run()`方法，使得该任务可以执行你的命令。
* 将`Runable`接口实现线程行为，必须将`Runable`对象转变为工作任务的传统方式是把它提交给一个`Thread`构造器；
* 再调用`Thread`对象的`start()`方法为该线程执行必需的初始化操作，然后调用`Runable`的`run()`方法，以便在这个新线程中启动该任务；

### 捕获异常
>由于线程的本质特性，使得你不能捕获从线程中逃逸的异常。
一旦异常逃出任务的`run（）`方法，它就会向外传播到控制台，除非你采取特殊的步骤捕获这种错误的异常；

***（线程的本质特性： 这里我的理解是线程启动处`thread.start（）`，与线程任务执行是不在同一个线程内的，所以导致在启动处你根本无法捕获异常信息，只能在任务内或者特殊全局异常信息捕获机制来实现；切面倒是很合适这个地方；）***


### 进入阻塞

>* 通过调用`sleep（milliseconds）`使任务进入休眠状态，在这种情况下，任务在指定的时间内不会运行；
* 通过调用`wait（）`使线程挂起。直到线程得到了`notify（）`或`notifyAll（）`消息（或者在JavaSE5的java.util.concurrent类库中等价的signal（）或signalAll（）消息），线程才会进入就绪状态；

### `sleep`

`Thread.sleep(XXX)`Thread线程类方法,休眠当前线程XXX毫秒,但是有时会使用sleep(0);

>* `Thread.Sleep(0)` 并非是真的要线程挂起0毫秒，意义在于这次调用Thread.Sleep(0)的当前线程确实的被冻结了一下，让其他线程有机会优先执行。
* `Thread.Sleep(0)` 是你的线程暂时放弃cpu，也就是释放一些未用的时间片给其他线程或进程使用，就相当于一个让位动作。



### `wait（）`与`notifyAll（）`

>* `wait（）`使你可以等待某个条件发生变化，而改变这个条件超出了当前方法的控制能力。
  * 因此`wait（）`会在等待外部世界产生变化的时候将任务挂起，并且只有在`notify（）`或`notifyAll（）`发生时，即表示发生了某些感兴趣的事物，这个任务才会被唤醒并去检查所产生的变化。且释放锁；
* `sleep（）`被调用的时候锁并没有释放，调用`yield（）`也属于这种情况；

### 线程返回值

无论`Thread`或者`Runable`作为执行工作的独立任务，本身执行的方法为**`class.run()`**, 类方法返回值为void,不返回值.
若希望任务在完成时能够返回一个值，可以通过实现Callable接口而不是Runable接口；
>* Java SE5中引入的Callable是一种具有类型参数的泛型，**它的类型参数表示的是从方法`call()`中返回的值，并且必须使用`ExecutorService.submit()`方法调用他**；
* `submit()`方法会产生`Future`对象，它用`Callable`返回结果的特定类型进行了参数化;
* 可以用`isDone()`方法来查询Future是否已经完成;
* 当任务完成时，它具有一个结果，你可以调用get()方法来获取该结果。不检查就直接调用get(),在这种情况下，get()将阻塞，直至结果准备就绪；


`Callable`能够获取线程执行返回值,通过`ExecutorService.submit()`方法调用，实际上调用到`AbstractExecutorService.submit(Callable<T> task)`：

```
    /**
     * @throws RejectedExecutionException {@inheritDoc}
     * @throws NullPointerException       {@inheritDoc}
     */
    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<T> ftask = newTaskFor(task);
        execute(ftask);
        return ftask;
    }

    /**
     * Returns a {@code RunnableFuture} for the given callable task.
     *
     * @param callable the callable task being wrapped
     * @param <T> the type of the callable's result
     * @return a {@code RunnableFuture} which, when run, will call the
     * underlying callable and which, as a {@code Future}, will yield
     * the callable's result as its result and provide for
     * cancellation of the underlying task
     * @since 1.6
     */
    protected <T> RunnableFuture<T> newTaskFor(Callable<T> callable) {
        return new FutureTask<T>(callable);
    }
```

以Callable作为参数，新建一个`FutureTask`可执行线程， 调用`execute(ftask)`将线程交由线程池工作队列进行调度执行，最终执行`FutureTask.run（）`方法：

```
	public void run() {
        if (state != NEW ||
            !UNSAFE.compareAndSwapObject(this, runnerOffset,
                                         null, Thread.currentThread()))
            return;
        try {
            Callable<V> c = callable;
            if (c != null && state == NEW) {
                V result;
                boolean ran;
                try {
                    result = c.call();
                    ran = true;
                } catch (Throwable ex) {
                    result = null;
                    ran = false;
                    setException(ex);
                }
                if (ran)
                    set(result);
            }
        } finally {
            // runner must be non-null until state is settled to
            // prevent concurrent calls to run()
            runner = null;
            // state must be re-read after nulling runner to prevent
            // leaked interrupts
            int s = state;
            if (s >= INTERRUPTING)
                handlePossibleCancellationInterrupt(s);
        }
    }
```
