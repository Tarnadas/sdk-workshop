import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { Button, Flex } from '@radix-ui/themes';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { checkValidNetwork, testnetChainIdHex } from './network';

export const Account: FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | undefined>();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  const { account, state } = useAccount();

  useEffect(() => {
    async function run() {
      if (!window.ethereum) return;
      const p = new BrowserProvider(window.ethereum);
      setProvider(p);
      const s = await p.getSigner();
      setSigner(s);

      await account.setAddress(s.address, {
        provider: window.ethereum,
        chain: {
          id: testnetChainIdHex
        }
      });
    }
    run();
  }, [account]);

  useEffect(() => {
    if (!provider) return;
    checkValidNetwork(provider);
  }, [provider]);

  return (
    <Flex gap="3" align="center" justify="center">
      <Button
        disabled={provider == null}
        onClick={async () => {
          if (!provider || !!signer) return;
          const s = await provider.getSigner();
          setSigner(s);
        }}
      >
        {signer
          ? `${signer.address.substring(0, 6)}...${signer.address.substr(-4)}`
          : 'Connect wallet'}
      </Button>

      <Button
        disabled={state.status > AccountStatusEnum.NotSignedIn}
        onClick={() => {
          account.createAccount();
        }}
      >
        Create Account
      </Button>

      <Button
        disabled={state.status > AccountStatusEnum.DisabledTrading}
        onClick={() => {
          account.createOrderlyKey(30);
        }}
      >
        Create Orderly Key
      </Button>
    </Flex>
  );
};
