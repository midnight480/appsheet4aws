import { Construct } from 'constructs';
import { aws_stepfunctions, aws_stepfunctions_tasks } from 'aws-cdk-lib';
import { Choice, Condition, Fail, Parallel, Pass, StateMachine, Wait, WaitTime,Chain } from 'aws-cdk-lib/aws-stepfunctions';

export class Sfn {
    public sfn: aws_stepfunctions.StateMachine;

    constructor() { };
    public createSfn(scope: Construct, sfnName: string) {
        this.sfn = new StateMachine(scope, sfnName, {
            definition: 
            new aws_stepfunctions.Pass(scope, "Hello, World", {
              result: aws_stepfunctions.Result.fromObject({
                "Hello": "World"
                }),
              resultPath: aws_stepfunctions.JsonPath.DISCARD,
            })
        });
        return this.sfn;
    }
}
