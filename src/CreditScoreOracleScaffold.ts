import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
} from 'snarkyjs';

const ORACLE_PUBLIC_KEY =
  'B62qp24xA8az6sZbCFLaswALCKZLYWSErw4rAbej3b4aoLqumamcSAu';

export class CreditScoreOracle extends SmartContract {
  // State

  // Events

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    // Initialize contract state
  }

  @method verify(id: Field, creditScore: Field, signature: Signature) {
    // Get on-chain variables

    // Verify signature

    // Check that signature is valid

    // Check that credit score is above 700
    // `creditScore.assertGte(700) will also work, SnarkyJS will convert 700
    // the JavaScript number into a Field :)

    // Emit an event indicating that the user id has a sufficiently high
    // credit score
  }
}
