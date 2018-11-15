#!/bin/sh

export PATH=$PATH:$HOME/bin
export NODE_HOME="/D/Program Files/node-v8.9.4-win-x64"
PATH=$NODE_HOME/bin:$PATH

isRun=`ps -ef | grep "docsify" | grep -v grep | wc -l`

if [ $isRun = "1" ]; then
   echo "docsify is runing....."
else
   echo "start docsify service...."
   git pull 
   docsify serve --port 5000 docs
fi


