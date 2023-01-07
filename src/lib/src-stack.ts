import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { S3 } from './resource/s3';
import { Ddb } from './resource/ddb';
import { Iam } from './resource/iam';
import { Sfn } from './resource/sfn';
import { Eb } from './resource/eventbridge';

import { PolicyDocument,PolicyStatement,Effect, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';

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

    // EventBridge Pipes
    const ebPipesSourceIamRoleName = 'appsheet4aws-eb-pipes-source-iam-role';
    const ebPipesTargetIamRoleName = 'appsheet4aws-eb-pipes-target-iam-role';
    const ebPipesIamRoleName = 'appsheet4aws-eb-iam-role';

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

    // eventbridge pipes
    //const pipesSourcePolicy = iam.createIamPolicy4ebPipesSource(this, ebPipesSourceIamRoleName);
    //const pipesTargetPolicy = iam.createIamPolicy4ebPipesTarget(this, ebPipesTargetIamRoleName);
    //const pipesIamRole = iam.createIamRole4ebPipes(this, ebPipesIamRoleName, pipesSourcePolicy, pipesTargetPolicy); 
    //const pipesIamRole = iam.createIamRole4ebPipes(this, ebPipesIamRoleName); 
    //pipesIamRole.attachInlinePolicy(pipesSourcePolicy);
    //pipesIamRole.attachInlinePolicy(pipesTargetPolicy);
    //const pipes = eb.createEbPipes(this, pipesIamRole, ddb.table, eb.eventbridge);
    
    // ********************
    // eventbridge pipes
    const sourcePolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [(ddb.table.tableStreamArn as string)],
          actions: [
            'dynamodb:DescribeStream',
            'dynamodb:GetRecords',
            'dynamodb:GetShardIterator',
            'dynamodb:ListStreams',
          ],
          effect: Effect.ALLOW,
        }),
      ],
    });

    const targetPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [eb.eventbridge.eventBusArn],
          actions: ['events:PutEvents','state:*'],
          effect: Effect.ALLOW,
        }),
      ],
    });

    const pipeRole = new Role(this, 'role', {
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
      inlinePolicies: {
        sourcePolicy,
        targetPolicy,
      },
    });

    
    // Create new Pipe
    const pipe = new CfnPipe(this, 'pipe', {
      roleArn: pipeRole.roleArn,
      source: (ddb.table.tableStreamArn as string), 
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: cdk.aws_lambda.StartingPosition.LATEST,
        },
      },
      target: sfn.sfn.stateMachineArn,
    });
    //************* */

    // Output 
    new cdk.CfnOutput(this, 'S3 Bucket Arn', { value: s3bucket.bucket.bucketArn}) ;
    new cdk.CfnOutput(this, 'DynamoDB Arn', { value: ddb.table.tableArn }) ;
    //new cdk.CfnOutput(this, 'DynamoDB Arn', { value: (ddb.table.tableStreamArn as string) }) ;
    //new cdk.CfnOutput(this, 'Kinesis Stream Arn', { value: kinesisStream.stream.streamArn }) ;
    new cdk.CfnOutput(this, 'IAM User Name', { value: iamUser.userName }) ;
    new cdk.CfnOutput(this, 'IAM Policy Name', { value: iamPolicy.policyName }) ;
    new cdk.CfnOutput(this, 'Step Functions Arn', { value: sfn.sfn.stateMachineArn }) ;
    new cdk.CfnOutput(this, 'EventBridge Arn', { value: eb.eventbridge.eventBusArn }) ;
    new cdk.CfnOutput(this, 'EventBridge Pipe Attr Arn', { value: pipe.attrArn }) ;
    new cdk.CfnOutput(this, 'EventBridge Pipe Role Arn', { value: pipe.roleArn }) ;

  }
}
