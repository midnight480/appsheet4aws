import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam } from 'aws-cdk-lib';

export class Iam {
    constructor() { };
    public iamUser: aws_iam.User;
    public iamPolicy: aws_iam.Policy;
    public iamPolicyDocument: aws_iam.PolicyDocument;
    public iamRole: aws_iam.Role;


    public createIamUser(scope: Construct, iamName: string) {
        this.iamUser = new aws_iam.User(scope, iamName, {
            userName: iamName,
        });
        return this.iamUser;
    }
    public createIamPolicy(scope: Construct, iamPolicyName: string,s3BucketName: string,ddbTableName: string) {
        this.iamPolicy = new aws_iam.Policy(scope, iamPolicyName, {
            policyName: iamPolicyName,
            statements: [
              new aws_iam.PolicyStatement({
                effect:  aws_iam.Effect.ALLOW,
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
              new aws_iam.PolicyStatement({
                effect: aws_iam.Effect.ALLOW,
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
        return this.iamPolicy;
    }

    public attachToUser(iamUser: aws_iam.User, iamPolicy: aws_iam.Policy) {
        iamUser.attachInlinePolicy(this.iamPolicy);
    }

    public getUserName(iamUser: aws_iam.User) {
        return iamUser.userName;
    }

    public getPolicyName(iamPolicy: aws_iam.Policy) {
        return iamPolicy.policyName;
    }

    public createIamPolicy4ebPipesSource(scope: Construct, iamPolicyName: string) {
        this.iamPolicy = new aws_iam.Policy(scope, 'Create IAM Policy 4 Source', {
          policyName: iamPolicyName,
              statements: [
                new aws_iam.PolicyStatement({
                    effect: aws_iam.Effect.ALLOW,
                    actions: [
                      'dynamodb:DescribeStream',
                      'dynamodb:GetRecords',
                      'dynamodb:GetShardIterator',
                      'dynamodb:ListStreams',
                    ],
                  }),
            ],
        });
        return this.iamPolicy;
    }                              

    public createIamPolicy4ebPipesTarget(scope: Construct, iamPolicyName: string) {
      this.iamPolicy = new aws_iam.Policy(scope, 'Create IAM Policy 4 Target', {
        policyName: iamPolicyName,
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                'state:*',
              ],
              resources: [
                '*',   
              ],
            }), 
          ]
      },)
      return this.iamPolicy;
    }
    
    public createIamRole4ebPipes(scope: Construct, iamRoleName: string, inlinePolicySource: aws_iam.Policy, inlinePolicyTarget: aws_iam.Policy ) {
        const iamRole = new aws_iam.Role(scope, 'Create IAM Role 4 EB Pipes', {
            assumedBy: new aws_iam.ServicePrincipal('pipes.amazonaws.com'),
            roleName: iamRoleName,
        });
        return iamRole;
    }
    
}

