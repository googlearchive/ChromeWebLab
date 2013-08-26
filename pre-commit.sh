#!/bin/sh

# check for how many uncommitted changes we have
# stash changes
# run grunt task 
# restore stashed files if anything was stashed
# exit with error if grunt fails

NAME=$(git branch | grep '*' | sed 's/* //')

echo "Running pre-commit hook on: " $NAME

# don't run on rebase
if [ $NAME != '(no branch)' ]
then
  
  CHANGES=$(git diff --numstat | wc -l)
  CHANGES_CACHED=$(git diff --cached --numstat | wc -l)
  TOTAL_CHANGES=$(($CHANGES + $CHANGES_CACHED))

  git stash -k   # the "-k" makes git stash all changes, staged & unstaged 
  grunt 

  RETVAL=$?

  if [ $TOTAL_CHANGES -ne "0" ]
  then
    echo "Popping" $TOTAL_CHANGES "changes off the stack..."
    git stash pop -q
  fi      

  if [ $RETVAL -ne 0 ] 
  then
    echo "Grunt task failed, exiting..."
    exit 1
  fi

  echo "Complete."
fi