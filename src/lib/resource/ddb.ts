import { aws_dynamodb, RemovalPolicy,aws_kinesis } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Ddb {
    public table: aws_dynamodb.Table;

    constructor() { };
        public createDdb(scope: Construct, tableName: string, partitionName: string) {
            this.table = new aws_dynamodb.Table(scope, 'Create DynamoDB Table' , {
                tableName: tableName ,
                partitionKey: { name: partitionName, type: aws_dynamodb.AttributeType.STRING },
                billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
                removalPolicy: RemovalPolicy.DESTROY,
                kinesisStream: new aws_kinesis.Stream(scope, 'Create Kinesis Stream', {
                    streamName: 'appsheet4aws-kinesis',
                    shardCount: 1,
                    retentionPeriod: cdk.Duration.days(1),
                })
            })
            return this.table;
        }
}