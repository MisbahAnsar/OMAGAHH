/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/casino.json`.
 */
export type Casino = {
  "address": "8zD2fbTQHQRkdQrNs1f7Sd1ApZaUqN5c9GGZ6tSSy62M",
  "metadata": {
    "name": "casino",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solsgame Smart Contract"
  },
  "instructions": [
    {
      "name": "fundVault",
      "docs": [
        "Fund the casino vault (admin only)"
      ],
      "discriminator": [
        26,
        33,
        207,
        242,
        119,
        108,
        134,
        73
      ],
      "accounts": [
        {
          "name": "casino",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  115,
                  105,
                  110,
                  111
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "casino"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the casino vault"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "casino",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  115,
                  105,
                  110,
                  111
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "playCoinFlip",
      "docs": [
        "Place a bet (Coin Flip)"
      ],
      "discriminator": [
        221,
        213,
        139,
        239,
        108,
        34,
        18,
        12
      ],
      "accounts": [
        {
          "name": "casino",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  115,
                  105,
                  110,
                  111
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "u8"
        }
      ]
    },
    {
      "name": "playDiceRoll",
      "docs": [
        "Play Dice Roll"
      ],
      "discriminator": [
        111,
        158,
        153,
        47,
        87,
        64,
        11,
        126
      ],
      "accounts": [
        {
          "name": "casino",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  115,
                  105,
                  110,
                  111
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "u8"
        },
        {
          "name": "isOver",
          "type": "bool"
        }
      ]
    },
    {
      "name": "playSlots",
      "docs": [
        "Play Slots"
      ],
      "discriminator": [
        143,
        50,
        70,
        130,
        212,
        96,
        69,
        23
      ],
      "accounts": [
        {
          "name": "casino",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  115,
                  105,
                  110,
                  111
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "casino",
      "discriminator": [
        159,
        97,
        152,
        221,
        184,
        65,
        3,
        124
      ]
    }
  ],
  "events": [
    {
      "name": "gamePlayed",
      "discriminator": [
        34,
        108,
        235,
        57,
        253,
        173,
        228,
        36
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "betTooLow",
      "msg": "Bet amount is too low"
    },
    {
      "code": 6001,
      "name": "betTooHigh",
      "msg": "Bet amount is too high"
    },
    {
      "code": 6002,
      "name": "invalidPrediction",
      "msg": "Invalid prediction"
    },
    {
      "code": 6003,
      "name": "invalidBetAmount",
      "msg": "Invalid bet amount"
    }
  ],
  "types": [
    {
      "name": "casino",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "totalWagered",
            "type": "u64"
          },
          {
            "name": "totalPayout",
            "type": "u64"
          },
          {
            "name": "houseEdge",
            "type": "u16"
          },
          {
            "name": "minBet",
            "type": "u64"
          },
          {
            "name": "maxBet",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "gamePlayed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "gameType",
            "type": "u8"
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": "u8"
          },
          {
            "name": "result",
            "type": "u8"
          },
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "payout",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
