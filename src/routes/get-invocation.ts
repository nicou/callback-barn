import { getListenerInvocations } from "../integrations/aws/dynamodb";

export const handleGetInvocation = async (listenerId: string): Promise<any> => {
  return await getListenerInvocations(listenerId);
};
