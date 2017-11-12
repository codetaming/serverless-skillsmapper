#!/usr/bin/env bash
function ec2-ssh () {
  ssh -i serverless.pem ec2-user@$(aws ec2 describe-instances --filter Name=instance-id,Values=$1 | jq '.Reservations[0].Instances[0].PublicDnsName' | tr -d '"')
}
ec2-ssh i-0ba99108fb4757770
#ssh -i serverless.pem ec2-user@ec2-54-76-163-19.eu-west-1.compute.amazonaws.com