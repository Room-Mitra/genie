References :
https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2


Commands :

1. Local Instance of EC2 : 
npm start

2. Code sync between local and EC2 :
rsync -avz --exclude 'node_modules' --exclude '.git' \
-e "ssh -i ./config/ireland-adithya-macAir.pem" \
. ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com:~/app

3. EC2 log tail :  Ec2 > config
ssh -i "ireland-adithya-macAir.pem" ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com
sudo journalctl -fu myapp.service

4. Ec2 ssh systemmd
ssh -i "ireland-adithya-macAir.pem" ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com



Changes to be made ::
. Provide button in webapp to clear ec2 cache
. EC2 cache should have TTL
. Uncached Webapp api calls should get uncached EC2 results
. Download intents CSV & maintain here
. CICD pipeline
. 