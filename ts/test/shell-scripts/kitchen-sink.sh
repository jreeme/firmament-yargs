#!/usr/bin/env bash
case $1 in
  writeToStdOutErrExitWithErrCode)
    counter=1
    for arg in $@
    do
      if [ ${counter} -ge 5 ]
      then
        if [ $3 == 'writeToStdOut' ]
        then
          printf "$arg"
        fi
        if [ $4 == 'writeToStdErr' ]
        then
          #echo String sent to stderr >&2
          printf "$arg" >&2
        fi
        sleep 1
      fi
      ((counter++))
    done
    exit $2
    ;;
  exitWithErrCode)
    exit $2
    ;;
esac

