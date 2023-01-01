import { Construct } from 'constructs';
import { aws_events, aws_events_targets, aws_stepfunctions } from 'aws-cdk-lib';

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
    // eventbridge pipeline to send events to eventbridge
    public eventRuleToStepFunction(scope: Construct, sfn: aws_stepfunctions.StateMachine) {
        const rule = new aws_events.Rule(scope, 'Event Rule', {
            eventPattern: {
                source: ['dynamodb'],
                detailType: ['dynamodb'],
            },
            targets: [new aws_events_targets.SfnStateMachine(sfn)],
        })
        return rule;
    }

    // target stepfunction state machine

}

