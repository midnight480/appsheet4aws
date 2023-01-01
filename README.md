# appsheet4aws

## prepare

```bash
cd ${WORKDIR}
git clone git@github.com:midnight480/appsheet4aws.git
```

## check aws clie in your environment

```bash
% aws --version
aws-cli/2.9.8 Python/3.11.0 Darwin/22.2.0 source/arm64 prompt/off
% 
```

## check aws cdk in your environment

```bash
% cdk --version
2.58.1 (build 3d8df57)
% 
```

## check 

```bash
aws sts get-caller-identity
```

## Create Resources

```bash
cdk deploy
```

## Create IAM AccessKey via AWS CLI

```bash
aws iam create-access-key --user-name appsheet4user
```

## Cleanup Resources

```bash
cdk destroy
```