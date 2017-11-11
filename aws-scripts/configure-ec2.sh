#!/usr/bin/env bash
#Script to configure an EC2 instance for deployment to avoid having to use slow internet connection for deployment

#create ssh key
ssh-keygen -t rsa -b 4096 -C ""
cat ~/.ssh/id_rsa.pub

#add key to github
sudo yum update

# install git
sudo yum -y install git

#install aws cli
pip install awscli --upgrade --user

#configure aws cli

#install nodejs
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 6.11.5

#install serverless
npm install -g serverless

#clone install
git clone git@github.com:codetaming/serverless-skillsmapper.git
cd serverless-skillsmapper/
cd pipeline
npm install

#add private
vi ../private.yml
#add content

#deploy
serverless deploy -v

