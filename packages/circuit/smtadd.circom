pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom";

component main {public [oldRoot,newKey,newValue]} = SMTProcessor(10);
