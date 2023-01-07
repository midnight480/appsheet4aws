import { Construct } from 'constructs';
import { aws_events, aws_events_targets, aws_pipes, aws_stepfunctions,aws_iam, aws_dynamodb } from 'aws-cdk-lib';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';

export class Eb {
    public eventbridge: aws_events.EventBus;

    constructor() { };
    // create a eventbridge pipeline to send events to eventbridge
    public createEb(scope: Construct, ebName: string) {
        this.eventbridge = new aws_events.EventBus(scope, 'Create EventBridge', {
            eventBusName: ebName,
        })
        return this.eventbridge;
    }

    public getEbArn() {
        return this.eventbridge.eventBusArn;
    }

    // eventbridge pipeline to send events to eventbridge
    public eventRuleToStepFunction(scope: Construct, sfn: aws_stepfunctions.StateMachine) {
        const rule = new aws_events.Rule(scope, 'Event Rule', {
            eventPattern: {
                source: ['dynamodb'],
                region: ['us-west-2'],
                detailType: ['dynamodb'],
            },
            targets: [new aws_events_targets.SfnStateMachine(sfn)],
        })
        return rule;
    }

    public createEbPipes(scope: Construct, pipesRoleArn: aws_iam.Role, source: aws_dynamodb.Table, eb: aws_events.EventBus) {
        const pipes = new CfnPipe(scope, 'Create EventBridge Pipes', {
               roleArn: pipesRoleArn.roleArn,
                source: source.tableArn,
                target: eb.eventBusArn,
            })
        return pipes;
    }

}

