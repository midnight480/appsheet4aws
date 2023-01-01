import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { S3 } from './resource/s3';
import { Ddb } from './resource/ddb';
import { Iam } from './resource/iam';
import { Sfn } from './resource/sfn';
import { Eb } from './resource/eventbridge';

export class SrcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*-- declear const  --*/

    // S3 Bucket 
    const s3BucketName = 'appsheet4aws-shibao';
    // DynamoDB 
    const ddbTableName = 'sampleTable';
    const ddbPartitionName = 'Date';
    // Kinesis Stream 
    const kinesisStreamName = 'appsheet4aws-kinesis-stream';
    // IAM
    const iamUserName = 'appsheet4user'
    const iamPolicyName = 'appsheet4policy'
    // Step Function 
    const sfnName = 'appsheet4aws-sfn';
    // EventBridge
    const ebName = 'appsheet4aws-eb';

    /*--- S3 Task --*/
    const s3bucket = new S3();
    // Create S3 Bucket
    s3bucket.createS3(this, s3BucketName);

    /*-- DynamoDB Tasks --*/
    const ddb = new Ddb();
    // Create DynamoDB
    ddb.createDdb(this, ddbTableName, ddbPartitionName, kinesisStreamName);
    // Get DynamoDB Item for Step Functions
    const getDdbItem = ddb.getDdbItem(this);
    // Update DynamoDB for Step Functions
    const updateDdbItemTranslateText = ddb.updateDdbItemComprehendText(this);

    /*-- IAM User Tasks --*/
    const iam = new Iam();
    // Create IAM User
    const iamUser = iam.createIamUser(this, iamUserName);
    // Create IAM Policy
    const iamPolicy = iam.createIamPolicy(this, iamPolicyName, s3BucketName, ddbTableName);
    // Attach IAM Policy to IAM User
    iamPolicy.attachToUser(iamUser);

    // step function
    const sfn = new Sfn();
    sfn.createSfn(this, sfnName);

    // eventbridge
    const eb = new Eb();
    eb.createEb(this, ebName);
    eb.eventRuleToStepFunction(this, sfn.sfn);

    new cdk.CfnOutput(this, 'S3 Bucket Arn', { value: s3bucket.bucket.bucketArn}) ;
    new cdk.CfnOutput(this, 'DynamoDB Arn', { value: ddb.table.tableArn }) ;
    //new cdk.CfnOutput(this, 'Kinesis Stream Arn', { value: kinesisStream.stream.streamArn }) ;
    new cdk.CfnOutput(this, 'IAM User Name', { value: iamUser.userName }) ;
    new cdk.CfnOutput(this, 'IAM Policy Name', { value: iamPolicy.policyName }) ;
    new cdk.CfnOutput(this, 'Step Functions Arn', { value: sfn.sfn.stateMachineArn }) ;
    new cdk.CfnOutput(this, 'EventBridge Arn', { value: eb.eventbridge.eventBusArn }) ;

  }
}
