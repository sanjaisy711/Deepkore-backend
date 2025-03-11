import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import {
  GetCount,
  GetDocument,
  GetOneDocument,
  InsertManyDocument,
  UpdateManyDocument,
  UpdateOneDocument,
} from '../../connector/mongodb';
import {
  COMPANYFORMATSETTING,
  COMPANYHOLIDAY,
  COMPANYSETTING,
  COMPANYWORKSETTING,
} from '../../types/collection/capsettings';
import { statusCode } from '../../types/internalType';
import { CollectionName, UpdateMany, UpdateOne } from '../../types/mongoType';
import { ReplySuccess } from '../../types/responseType';
import { getYearRange } from '../helper/shared';
import _ from 'lodash';

export const getSetting = async (req: Request): Promise<ReplySuccess> => {
  try {
    const settings = (await GetOneDocument(
      CollectionName.COMPANYSETTING,
      {
        internalstatus: 1,
        externalstatus: 1,
        leadid: req.capcontext.leadid,
      },
      {
        internalstatus: 0,
        externalstatus: 0,
        leadid: 0,
      }
    )) as COMPANYSETTING;
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Fetched successfully',
        data: settings || {},
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateSetting = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData: COMPANYSETTING = {
      accountname: req.body.accountname,
      accountdomain: req.body.accountdomain,
      accountowner: req.body.accountowner,
      accountlogo: req.body.accountlogo,
      mobileappname: req.body.mobileappname,
      mobileapplogo: req.body.mobileapplogo,
      accounttheme: req.body.accounttheme,
      startingtime: req.body.startingtime,
      closingtime: req.body.closingtime,
      holidayflagremainder: Number(req.body.holidayflagremainder),
      internalstatus: 1,
      externalstatus: 1,
      recordstatus: 1,
      leadid: req.capcontext.leadid,
      modifiedon: Date.now(),
      modifiedby: req.capcontext.loginUserId,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.COMPANYSETTING,
      {
        leadid: req.capcontext.leadid,
      },
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      if (upsertedCount) {
        setHolidayFlag(req.capcontext.leadid).catch((e) => e);
      }
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getFormatSetting = async (req: Request): Promise<ReplySuccess> => {
  try {
    const formatsettings = (await GetOneDocument(
      CollectionName.COMPANYFORMATSETTING,
      {
        internalstatus: 1,
        externalstatus: 1,
        leadid: req.capcontext.leadid,
      },
      {
        internalstatus: 0,
        externalstatus: 0,
        leadid: 0,
      }
    )) as COMPANYFORMATSETTING;
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Fetched successfully',
        data: formatsettings || {},
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateFormatSetting = async (
  req: Request
): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData: COMPANYFORMATSETTING = {
      accounttimezone: req.body.accounttimezone,
      language: req.body.language,
      dateformat: req.body.dateformat,
      numberformat: req.body.numberformat,
      currencyformat: req.body.currencyformat,
      internalstatus: 1,
      externalstatus: 1,
      recordstatus: 1,
      leadid: req.capcontext.leadid,
      modifiedon: Date.now(),
      modifiedby: req.capcontext.loginUserId,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.COMPANYFORMATSETTING,
      {
        leadid: req.capcontext.leadid,
      },
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getWorkSetting = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const worksettings = (await GetDocument(
      CollectionName.COMPANYWORKSETTING,
      {
        internalstatus: 1,
        externalstatus: 1,
        leadid: req.capcontext.leadid,
        year: Number(req.params.year),
      },
      {
        internalstatus: 0,
        externalstatus: 0,
        leadid: 0,
      },
      {}
    )) as COMPANYWORKSETTING[];
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Fetched successfully',
        data: worksettings || [],
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateWorkSetting = async (
  req: Request
): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const updateData: COMPANYWORKSETTING = {
      year: Number(req.body.year),
      day: Number(req.body.day),
      workstatus: req.body.workstatus,
      internalstatus: 1,
      externalstatus: 1,
      recordstatus: 1,
      leadid: req.capcontext.leadid,
      modifiedon: Date.now(),
      modifiedby: req.capcontext.loginUserId,
    };
    const params = { $set: updateData };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.COMPANYWORKSETTING,
      {
        year: Number(req.body.year),
        day: Number(req.body.day),
        leadid: req.capcontext.leadid,
      },
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      const nextYear = new Date().getFullYear() + 1;
      if (nextYear === Number(req.body.year)) {
        setHolidayFlag(req.capcontext.leadid, nextYear).catch((e) => e);
      }
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const getHoliday = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const { start, end } = getYearRange(Number(req.params.year));
    const hoildaysettings = (await GetDocument(
      CollectionName.COMPANYHOLIDAY,
      {
        internalstatus: 1,
        externalstatus: 1,
        leadid: req.capcontext.leadid,
        holidaydate: { $gte: start, $lte: end },
      },
      {
        internalstatus: 0,
        externalstatus: 0,
        leadid: 0,
      },
      {}
    )) as COMPANYHOLIDAY[];
    return {
      code: statusCode.Success,
      response: {
        status: 1,
        message: 'Fetched successfully',
        data: hoildaysettings || [],
      },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const updateHoliday = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const holidaydate = new Date(req.body.holidaydate).getTime();
    const updateData: COMPANYHOLIDAY = {
      holidaydate,
      description: req.body.description,
      internalstatus: 1,
      externalstatus: 1,
      recordstatus: 1,
      leadid: req.capcontext.leadid,
      modifiedon: Date.now(),
      modifiedby: req.capcontext.loginUserId,
    };
    const params = { $set: updateData };
    const query = req.body._id
      ? { _id: new ObjectId(req.body._id), leadid: req.capcontext.leadid }
      : {
          leadid: req.capcontext.leadid,
          holidaydate,
        };
    const { upsertedCount, modifiedCount }: UpdateOne = await UpdateOneDocument(
      CollectionName.COMPANYHOLIDAY,
      query,
      params,
      { upsert: true }
    );

    if (upsertedCount || modifiedCount) {
      const nextYear = new Date().getFullYear() + 1;
      if (nextYear === new Date(holidaydate).getFullYear()) {
        setHolidayFlag(req.capcontext.leadid, nextYear).catch((e) => e);
      }
      return {
        code: statusCode.Success,
        response: { status: 1, message: 'Updated successfully' },
      };
    } else {
      return {
        code: statusCode.BadRequest,
        response: { status: 0, message: 'Error in updating' },
      };
    }
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

export const cloneHoliday = async (req: Request): Promise<ReplySuccess> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        code: statusCode.UnprocessableEntity,
        response: { status: 0, message: errors.array()[0].msg },
      };
    }
    const { start, end } = getYearRange(Number(req.body.fromYear));
    const hoildaysettings = (await GetDocument(
      CollectionName.COMPANYHOLIDAY,
      {
        internalstatus: 1,
        externalstatus: 1,
        leadid: req.capcontext.leadid,
        holidaydate: { $gte: start, $lte: end },
      },
      {},
      {}
    )) as COMPANYHOLIDAY[];
    const toYear = Number(req.body.toYear);
    const toYearRange = getYearRange(toYear);
    const { matchedCount, modifiedCount }: UpdateMany =
      await UpdateManyDocument(
        CollectionName.COMPANYHOLIDAY,
        {
          leadid: req.capcontext.leadid,
          holidaydate: { $gte: toYearRange.start, $lte: toYearRange.end },
        },
        {
          $set: {
            internalstatus: 0,
            externalstatus: 0,
            modifiedon: Date.now(),
            modifiedby: req.capcontext.loginUserId,
          },
        },
        {}
      );
    if (matchedCount && !modifiedCount) {
      return {
        code: statusCode.InternalServer,
        response: { status: 0, message: 'Error in copying holidays' },
      };
    }

    const insertData = _.map(hoildaysettings, function (holidays) {
      return {
        holidaydate: getToYearDate(new Date(holidays.holidaydate), toYear),
        description: holidays.description,
        internalstatus: 1,
        externalstatus: 1,
        recordstatus: 1,
        leadid: req.capcontext.leadid,
        modifiedon: Date.now(),
        modifiedby: req.capcontext.loginUserId,
      };
    });
    await InsertManyDocument(CollectionName.COMPANYHOLIDAY, insertData);
    const nextYear = new Date().getFullYear() + 1;
    if (nextYear === toYear) {
      setHolidayFlag(req.capcontext.leadid, nextYear).catch((e) => e);
    }
    return {
      code: statusCode.Success,
      response: { status: 1, message: 'Copied successfully' },
    };
  } catch (e) {
    return {
      code: statusCode.InternalServer,
      response: { status: 0, message: 'Server error' },
    };
  }
};

async function setHolidayFlag(leadid: ObjectId, year?: number): Promise<void> {
  const { start, end } = getYearRange(year);
  const holidayCount = await GetCount(CollectionName.COMPANYHOLIDAY, {
    leadid,
    holidaydate: { $gte: start, $lte: end },
  });
  await UpdateOneDocument(
    CollectionName.COMPANYSETTING,
    {
      leadid,
    },
    {
      $set: {
        holidayflag: holidayCount > 0,
      },
    },
    {}
  );
}

function getToYearDate(date: Date, year: number): number {
  return new Date(year, date.getMonth(), date.getDate()).getTime();
}
