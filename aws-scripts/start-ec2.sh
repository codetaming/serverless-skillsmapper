#!/usr/bin/env bash
aws ec2 start-instances --instance-ids i-0ba99108fb4757770
sleep 20
connect-to-ec2.sh