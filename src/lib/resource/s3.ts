import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';

export class S3 {
    public bucket: Bucket;

    constructor() { };

        public createS3(scope: Construct, s3BucketName: string) {
            this.bucket = new Bucket(scope, "Create S3 Bucket", {
                bucketName: s3BucketName,
                accessControl: BucketAccessControl.PRIVATE,
                encryption: BucketEncryption.S3_MANAGED,
                versioned: false,
                blockPublicAccess: BlockPublicAccess.BLOCK_ALL ,
                removalPolicy: RemovalPolicy.DESTROY ,
                autoDeleteObjects: true ,
            })
            return this.bucket ;
            ;

    }
}