#!/bin/sh

for FILEPATH in "$@"
do
  STATUS=`git status --porcelain $FILEPATH`
  FLAG=`echo $STATUS | grep -o "^[D,R]"`
  if [ -z "$FLAG" ]
  then
    # If FILEPATH is a test file, run it with ava only if not a fixture or an helper
    FILETEST=`echo $FILEPATH | grep -P ".*[_]{0,2}?tests?[_]{0,2}?/?.*\.[jstxmc]{0,3}$"`
    if [ ! -z "$FILETEST" ]
    then
      NONTEST=`echo $FILEPATH | grep -P "^.*[_]{0,2}?tests?[_]{0,2}?/?(helpers?|fixtures?)"`
      if [ -z "$NONTEST" ]
      then
        UNIT="$UNIT $FILEPATH"
      fi
    # If FILEPATH is a source file, run only tests refered to FILENAME
    else
      BASENAME=`basename $FILEPATH`
      FILENAME=${BASENAME%%.*}
      SRC="$SRC -m='$FILENAME*'"
    fi
  fi
done

if [ ! -z $SRC]
then
  eval ava -v $SRC
fi

if [ ! -z $UNIT]
then
  eval ava -v $UNIT
fi
