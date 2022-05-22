#!/bin/sh

n=0
until [ "$n" -ge 50 ]
do
   npx prisma migrate dev && break
   n=$((n+1))
   echo "Waiting..."
   sleep 5
done