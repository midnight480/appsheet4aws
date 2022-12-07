import { aws_dynamodb, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoUpdateItem }  from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class Ddb {
    public table: aws_dynamodb.Table;

    constructor() { };

        public createDdb(scope: Construct, tableName: string, partitionName: string) {
            this.table = new aws_dynamodb.Table(scope, 'Create DynamoDB Table' , {
                tableName: tableName ,
                partitionKey: { name: partitionName, type: aws_dynamodb.AttributeType.STRING },
                billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
                removalPolicy: RemovalPolicy.DESTROY
            })
            return this.table;
        }

}