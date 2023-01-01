import { aws_dynamodb, RemovalPolicy,aws_kinesis } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoGetItem, DynamoAttributeValue, DynamoUpdateItem }  from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { JsonPath } from 'aws-cdk-lib/aws-stepfunctions';

export class Ddb {
    public table: aws_dynamodb.Table;
    public getItem: DynamoGetItem;
    public updateItemComprehendText: DynamoUpdateItem;

    constructor() { };
        public createDdb(scope: Construct, tableName: string, partitionName: string, kinesisStreamName: string) {
            this.table = new aws_dynamodb.Table(scope, 'Create DynamoDB Table' , {
                tableName: tableName ,
                partitionKey: { name: partitionName, type: aws_dynamodb.AttributeType.STRING },
                billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
                removalPolicy: RemovalPolicy.DESTROY,
                kinesisStream: new aws_kinesis.Stream(scope, 'Create Kinesis Stream', {
                    streamName: kinesisStreamName,
                    shardCount: 1,
                    retentionPeriod: cdk.Duration.days(1),
                })
            })
            return this.table;
        }
        public getDdbItem(scope: Construct){
            this.getItem = new DynamoGetItem(scope, 'Get Ddb Item' , {
                key: { Name: DynamoAttributeValue.fromString(JsonPath.stringAt('$.Name')) },
                table: this.table ,
                consistentRead: false ,
            });
            return this.getItem;
        }

        public updateDdbItemComprehendText(scope: Construct){
            this.updateItemComprehendText = new DynamoUpdateItem(scope, 'Update Ddb Item for Comprehend Text' , {
                key: { Name: DynamoAttributeValue.fromString(JsonPath.stringAt('$.Item.Name.S')) },
                table: this.table ,
                expressionAttributeValues: {
                    ':ComprehendRef': DynamoAttributeValue.fromString(JsonPath.stringAt('$.Result.ComprehendText')),
                },
                    updateExpression: 'SET ComprehendRef = :ComprehendRef',
                });
            return this.updateItemComprehendText;
        }
}