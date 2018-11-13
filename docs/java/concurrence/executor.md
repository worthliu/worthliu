## 线程池

从JDK实现看,线程池通过`Executor`、`ExecutorService`两个接口定义线程池基础，`AbstractExecutorService`、`ThreadPoolExecutor`定义出线程池具体实现：

![executor](/images/Executor.png)

### AbstractExecutorService
AbstractExecutorService是他们的抽象实现类，提供线程池底层接口方法的所有实现；

```
	protected <T> RunnableFuture<T> newTaskFor(Runnable runnable, T value) {
	        return new FutureTask<T>(runnable, value);
	    }

    protected <T> RunnableFuture<T> newTaskFor(Callable<T> callable) {
        return new FutureTask<T>(callable);
    }

    public <T> Future<T> submit(Runnable task, T result) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<T> ftask = newTaskFor(task, result);
        execute(ftask);
        return ftask;
    }

    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<T> ftask = newTaskFor(task);
        execute(ftask);
        return ftask;
    }
```

### FutureTask

FutureTask，是线程池最后转换的执行单元入口参数（其实最终执行还是Runnable）

```
public class FutureTask<V> implements RunnableFuture<V>

public interface RunnableFuture<V> extends Runnable, Future<V>
```
```
public FutureTask(Callable<V> callable) {
        if (callable == null)
            throw new NullPointerException();
        this.callable = callable;
        this.state = NEW;       // ensure visibility of callable
}

public FutureTask(Runnable runnable, V result) {
        this.callable = Executors.callable(runnable, result);
        this.state = NEW;       // ensure visibility of callable
}

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

## ThreadPoolExecutor

`ThreadPoolExecutor`是线程池的真正实现，它的构造方法提供了一系列参数来配置线程池;

```
public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<runnable> workQueue);
```

>1. corePoolSize：线程池核心线程数，默认情况下，核心线程会在线程池中一直存活，即使它们处于闲置状态。
   * 如果ThreadPoolExecutor的allowCoreThreadTimeOut属性设置为true,那么闲置的核心线程在等待新任务到来时会有超时策略，这个时间间隔由keepAliveTime所指定的时长后，核心线程就会被终止。
2. maximumPoolSize：线程池所能容纳的最大线程数，当活动线程达到这个数值后，后续的新任务将被阻塞。
3. keepAliveTime：非核心线程闲置时的超时时长，超过这个时长，非核心线程就会被回收。
   * 当ThreadPoolExecutor的allowCoreThreadTimeOut属性设置为true时，keepAliveTime同样会作用于非核心线程。
4. unit：keepAliveTime 参数的时间单位。
5. workQueue：执行前用于保持任务的队列。此队列仅保持由 execute 方法提交的 Runnable 任务。
6. threadFactory：执行程序创建新线程时使用的工厂。
7. handler：由于超出线程范围和队列容量而使执行被阻塞时所使用的处理程序。

>ThreadPoolExecutor执行任务时遵循以下规则：
  1. 如果线程池中的线程数量未达到核心线程的数量，那么会直接启动一个核心线程来执行任务； 
  2. 如果线程池中的线程数量已经达到或者超过核心线程的数量，那么任务会被插入到任务队列中排队等待执行； 
  3. 如果步骤2中无法将任务插入到任务队列中，这往往是由于任务队列已满，这个时候如果线程数量未达到线程池规定的最大值，那么会立刻启动一个非核心线程来执行。 
  4. 如果步骤3中线程数量已经达到线程池规定的最大值，那么就拒绝执行此任务，ThreadPoolExecutor会调用RejectedExecutionHandler的rejectedExecution方法来通知调用者。

>调整线程池的大小:**线程池的最佳大小主要取决于系统的可用cpu的数目，以及工作队列中任务的特点;**
* 假如一个具有N个cpu的系统上只有一个工作队列，并且其中全部是**运算性质(不会阻塞)的任务**，那么**当线程池拥有N或N+1个工作线程时，一般会获得最大的cpu使用率**。
* 如果工作队列中包含会**执行IO操作并经常阻塞的任务**，则要让线程池的大小超过可用 cpu的数量，因为并不是所有的工作线程都一直在工作。选择一个典型的任务，然后估计在执行这个任务的工程中，**等待时间与实际占用cpu进行运算的时间的比例WT/ST。对于一个具有N个cpu的系统，需要设置大约N(1+WT/ST)个线程来保证cpu得到充分利用**。
* 当然,cpu利用率不是调整线程池过程中唯一要考虑的事项，随着线程池工作数目的增长，还会碰到内存或者其他资源的限制，如套接字，打开的文件句柄或数据库连接数目等。要保证多线程消耗的系统资源在系统承受的范围之内。	

## Executors线程池工具类

Java 类库提供了一个灵活的线程池以及一些有用的默认配置。可以通过调用Executors中的静态工厂方法之一来创建一个线程池

![executors](/images/executors.png)

>1. `newFixedThreadPool`：将创建一个固定长度的线程池，每当提交一个任务时就创建一个线程，直到达到线程池的最大数量。
  * 特点：线程数量固定，线程处于空闲状态时，它们并不会被回收，除非线程池被关闭。
  * 当所有线程都处于活动状态时，新任务都会处于等待状态，直到有线程空闲出来。基本线程数等于最大线程数，没有超时机制，使用无界的队列保存等待执行的任务。
2. `newCachedThreadPool`：将创建一个可缓存的线程池，如果线程池的当前规模超过了处理需求时，那么将回收空闲的线程，而当需求增加时，则可以添加新的线程，线程池的规模不存在任何限制。
  * 特点：基本线程数为0，最大线程数为`Integer.MAX_VALUE`.存活时间60s,采用异步队列`SynchronousQueue`来避免任务排队。
3. `newSingleThreadExecutor`：是一个单线程的`Executor`,它创建单个工作者线程来执行任务，如果这个线程异常结束，会创建另一个线程来替代。它能确保依照任务在对列中的顺序来串行执行（例如FIFO,LIFO,优先级）。
  * 特点：基本线程数和最大线程数都为1，无存活时间，采用无界的`LinkedBlockingQueue`来保存等待执行的任务。
4. `newScheduledThreadPool`：创建一个固定长度的线程池，而且以延迟或定时的方式来执行任务，类似于Timer.
