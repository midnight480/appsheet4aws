import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { User, Policy, PolicyStatement, AccessKey, Effect } from 'aws-cdk-lib/aws-iam';

import { S3 } from './resource/s3';
import { Ddb } from './resource/ddb';

export class SrcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*--- S3 Task --*/

    // S3 Bucket Name
    const s3BucketName = 'appsheet4aws-shibao';
    // S3 Bucket
    const s3bucket = new S3();
    s3bucket.createS3(this, s3BucketName);

    /*-- DynamoDB Tasks --*/

    // DynamoDB Table Name
    const ddbTableName = 'userTable';
    const ddbPartitionName = 'Name';
    // DynamoDB
    const ddb = new Ddb();
    ddb.createDdb(this, ddbTableName, ddbPartitionName);
  

    /*-- IAM User for S3, DyanamoDB --*/

    // IAM User
    const iamUserName = 'appsheet4user'
    const user = new User(this, iamUserName);
    
    // IAM Policy
    const iamPolicyName = 'appsheet4policy'
    const policy = new Policy(this, iamPolicyName, {
      policyName: iamPolicyName,
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            's3:List*',
            's3:Get*',
            's3:Put*',
            's3:Delete*',
          ], 
          resources: [
            `arn:aws:s3:::${s3BucketName}`,
            `arn:aws:s3:::${s3BucketName}/*`,
          ],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'dynamodb:ListTables',
            'dynamodb:PutItem',
            'dynamodb:GetItem',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:Update*',
            'dynamodb:Delete*',
            'dynamodb:List*',
            'dynamodb:Describe*',
            'dynamodb:BatchGet*',
            'dynamodb:BatchWrite*',
          ],
          resources: [
            `arn:aws:dynamodb:*:*:table/*`,
            `arn:aws:dynamodb:*:*:table/${ddbTableName}`,
            `arn:aws:dynamodb:*:*:table/${ddbTableName}/index/*`,
          ],
        }),
      ],
    });

    // Attach IAM Policy to IAM User
    policy.attachToUser(user);

    // Crate IAM Access Key
    //const accessKey = new AccessKey(this, 'appsheet4accesskey', {user});
    //const secretValue = new secretsmanager.Secret(this, 'appsheet4secret', {
    //  secretStringValue: accessKey.secretAccessKey,
    //});

    new cdk.CfnOutput(this, 'S3 Bucket Arn', { value: s3bucket.bucket.bucketArn}) ;
    new cdk.CfnOutput(this, 'DynamoDB Arn', { value: ddb.table.tableArn }) ;
    new cdk.CfnOutput(this, 'IAM User Name', { value: user.userName }) ;
    new cdk.CfnOutput(this, 'IAM Policy Name', { value: policy.policyName }) ;
    //new cdk.CfnOutput(this, 'IAM AccessKey', { value: accessKey.accessKeyId}) ;
    //new cdk.CfnOutput(this, 'IAM SecretKey', { value: secretValue.secretValue.toString() }) ;
  }
}
