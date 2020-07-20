import { Storage } from 'aws-amplify';

export async function uploadS3( s3Key, object, onSuccess, onError, onProgress  ) {
  const s3config = {
    level: "protected",
    progressCallback(progress) {
      onProgress( progress.loaded * 100/progress.total );
    }
  };
  try {
    await Storage.put(s3Key, object, s3config);
    onSuccess();
  } catch (err) {
    onError();
  }
};

export async function listS3(resolved, rejected) {
  try {
    const files = await Storage.list("files/", { level: "protected"});
    resolved(files);
  } catch (err) {
    rejected();
  }
};

export async function getS3(s3Key, resolved, rejected) {
  try {
    const s3Url = await Storage.get(s3Key, { level: "protected" });
    resolved(s3Url);
  } catch (err) {
    rejected();
  }
};