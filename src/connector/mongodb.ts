import _ from 'lodash';
import { MongoClient } from 'mongodb';
import { MongoCB, MongoOption } from '../types/internalType';
import {
  CollectionName,
  GetDocExt,
  InsertMany,
  InsertOne,
  UpdateMany,
  UpdateOne,
} from '../types/mongoType';

const state: any = {};

export const connect = async (
  url: string,
  dbname: string,
  options: MongoOption,
  done: MongoCB
): Promise<void> => {
  if (state.db) done();
  // Use connect method to connect to the server
  try {
    const client = await MongoClient.connect(url, options);
    console.log('Connected successfully to mongo');
    state.db = client.db(dbname);
    done();
  } catch (err: any) {
    done(err);
  }
};

/* insert */
export const InsertOneDocument = async (
  model: CollectionName,
  docs: any
): Promise<InsertOne> => {
  return await new Promise((resolve, reject) => {
    docs.createdAt = Date.now();
    docs.updatedAt = Date.now();
    const collection = state.db.collection(model);
    collection.insertOne(docs, (err: Error, resData: InsertOne) => {
      if (err) {
        reject(err);
      } else {
        resolve(resData);
      }
    });
  });
};
export const InsertManyDocument = async (
  model: CollectionName,
  docs: any
): Promise<InsertMany> => {
  return await new Promise((resolve, reject) => {
    const docsNew: any[] = _.map(docs, (r) => {
      r.createdAt = Date.now();
      r.updatedAt = Date.now();
      return r;
    });
    const collection = state.db.collection(model);
    collection.insertMany(docsNew, (err: Error, resData: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(resData);
      }
    });
  });
};
/* insert end */

/* count */
export const GetCount = async (
  model: CollectionName,
  query: any
): Promise<number> => {
  return await new Promise((resolve, reject) => {
    const collection = state.db.collection(model);
    collection.countDocuments(query, (err: Error, count: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(count);
      }
    });
  });
};
/* count end */

/* get document */
export const GetOneDocument = async (
  model: CollectionName,
  query: any,
  project: any
): Promise<any> => {
  return await new Promise((resolve, reject) => {
    const collection = state.db.collection(model);
    collection.findOne(
      query,
      { projection: project },
      (err: Error, docs: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      }
    );
  });
};
export const GetDocument = async (
  model: CollectionName,
  query: any,
  project: any,
  extension: GetDocExt
): Promise<any[]> => {
  return await new Promise((resolve, reject) => {
    const collection = state.db.collection(model);
    const Query = collection.find(query, { projection: project });
    if (extension.sort != null) {
      Query.sort(extension.sort);
    }
    if (extension.skip) {
      Query.skip(extension.skip);
    }
    if (extension.limit) {
      Query.limit(extension.limit);
    }
    Query.toArray((err: Error, docs: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};
/* get document end */

/* update */
export const UpdateOneDocument = async (
  model: CollectionName,
  query: any,
  params: any,
  options: any
): Promise<UpdateOne> => {
  return await new Promise((resolve, reject) => {
    if (params.$set === undefined) {
      params.$set = { updatedAt: Date.now() };
    } else {
      params.$set.updatedAt = Date.now();
    }
    const collection = state.db.collection(model);
    collection.updateOne(
      query,
      params,
      options,
      (err: Error, result: UpdateOne) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
export const UpdateManyDocument = async (
  model: CollectionName,
  query: any,
  params: any,
  options: any
): Promise<UpdateMany> => {
  return await new Promise((resolve, reject) => {
    if (params.$set === undefined) {
      params.$set = { updatedAt: Date.now() };
    } else {
      params.$set.updatedAt = Date.now();
    }
    const collection = state.db.collection(model);
    collection.updateMany(
      query,
      params,
      options,
      (err: Error, result: UpdateMany) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
/* update end */

/* aggregation */
export const GetAggregation = async (
  model: CollectionName,
  query: any
): Promise<any> => {
  return await new Promise((resolve, reject) => {
    const collection = state.db.collection(model);
    const Query = collection.aggregate(query, { allowDiskUse: true }); // for sort exceeding error
    // Query.collation({ locale: 'en_US', caseLevel: true, caseFirst: 'upper' }); // for checking upper case and lower case
    Query.toArray((err: Error, docs: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};
/* aggregation end */

/* delete */
// {
//   "acknowledged" : true,
//   "deletedCount" : 1.0
// }
export const DeleteOneDocument = async (
  model: CollectionName,
  query: any
): Promise<any> => {
  const collection = state.db.collection(model);
  return await new Promise((resolve, reject) => {
    collection.deleteOne(query, (err: Error, docs: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};
// {
//   "acknowledged" : true,
//   "deletedCount" : 2.0
// }

export const DeleteManyDocument = async (
  model: CollectionName,
  query: any
): Promise<any> => {
  const collection = state.db.collection(model);
  return await new Promise((resolve, reject) => {
    collection.deleteMany(query, (err: Error, docs: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};
/* delete end */

/* index */
export const createIndex = (
  model: CollectionName,
  query: any,
  callback: (err: Error, docs: any) => void
): void => {
  const collection = state.db.collection(model);
  collection.createIndex(query, (err: Error, docs: any) => {
    callback(err, docs);
  });
};
export const createIndexes = (
  model: CollectionName,
  query: any,
  callback: (err: Error, docs: any) => void
): void => {
  const collection = state.db.collection(model);
  collection.createIndexes(query, (err: Error, docs: any) => {
    callback(err, docs);
  });
};
export const getIndexes = (
  model: CollectionName,
  callback: (err: Error, docs: any) => void
): void => {
  const collection = state.db.collection(model);
  collection.getIndexes((err: Error, docs: any) => {
    callback(err, docs);
  });
};
export const dropIndex = (
  model: CollectionName,
  query: any,
  callback: (err: Error, docs: any) => void
): void => {
  const collection = state.db.collection(model);
  collection.dropIndex(query, (err: Error, docs: any) => {
    callback(err, docs);
  });
};
/* index end */
