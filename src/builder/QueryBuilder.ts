import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const search = (this?.query?.search || this?.query?.searchTerm) as string;
    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: search, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      'search',
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
      'startDate',
      'endDate',
    ];

    excludeFields.forEach((el) => delete queryObj[el]);

    // Handle date range filtering on createdAt
    if (this?.query?.startDate || this?.query?.endDate) {
      const createdAtFilter: Record<string, Date> = {};
      if (this.query.startDate) {
        createdAtFilter.$gte = new Date(this.query.startDate as string);
      }
      if (this.query.endDate) {
        const end = new Date(this.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        createdAtFilter.$lte = end;
      }
      this.modelQuery = this.modelQuery.find({
        createdAt: createdAtFilter,
      } as FilterQuery<T>);
    }

    // Clean empty or null query values
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] === '' || queryObj[key] == null) {
        delete queryObj[key];
      }
    });

    // Support advanced query operators (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.modelQuery = this.modelQuery.find(JSON.parse(queryStr) as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort = (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate() {
    const page = Math.max(1, Number(this?.query?.page) || 1);
    const limit = Math.max(1, Number(this?.query?.limit) || 10);
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields = (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Math.max(1, Number(this?.query?.page) || 1);
    const limit = Math.max(1, Number(this?.query?.limit) || 10);
    const totalPage = Math.ceil(total / limit) || 1;

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
