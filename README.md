# appsheet4aws

## prepare

```bash
cd ${WORKDIR}
git clone git@github.com:midnight480/appsheet4aws.git
```

## Create IAM AccessKey via AWS CLI

```bash
user=${SrcStack.IAMUserName}
aws sts get-caller-identity
aws iam create-access-key --user-name ${user}
```

