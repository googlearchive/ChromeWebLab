#!/bin/sh
# stash unstaged changes, run jsbeautifier task and restore stashed files

NAME=$(git branch | grep '*' | sed 's/* //')

# don't run on rebase
if [ $NAME != '(no branch)' ]
then
  git stash -q --keep-index
  grunt jsbeautifier

  RETVAL=$?

  if [ $RETVAL -ne 0 ]
  then
    exit 1
  fi

  git add .
  git stash pop -q
fi