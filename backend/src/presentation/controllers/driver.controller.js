const ApiResponse = require('../../application/common/ApiResponse');
const { toDriverResponseDto } = require('../../application/dtos/DriverDto');
const { parsePagination, buildMeta } = require('../../application/common/Pagination');

class DriverController {
  constructor({
    createDriverUseCase,
    getDriverUseCase,
    listDriversUseCase,
    listActiveDriversUseCase,
    updateDriverUseCase,
    deleteDriverUseCase,
  }) {
    this.createDriverUseCase = createDriverUseCase;
    this.getDriverUseCase = getDriverUseCase;
    this.listDriversUseCase = listDriversUseCase;
    this.listActiveDriversUseCase = listActiveDriversUseCase;
    this.updateDriverUseCase = updateDriverUseCase;
    this.deleteDriverUseCase = deleteDriverUseCase;
  }

  create = async (req, res) => {
    const driver = await this.createDriverUseCase.execute({ ...req.body, createdBy: req.user.id });
    return ApiResponse.success(res, {
      message: 'Driver created successfully',
      data: toDriverResponseDto(driver),
      statusCode: 201,
    });
  };

  getById = async (req, res) => {
    const driver = await this.getDriverUseCase.execute(req.params.id);
    return ApiResponse.success(res, {
      message: 'Driver retrieved successfully',
      data: toDriverResponseDto(driver),
    });
  };

  list = async (req, res) => {
    const pagination = parsePagination(req.query);
    const options = { ...pagination, status: req.query.status };
    const { rows, total } = await this.listDriversUseCase.execute(options);

    return ApiResponse.success(res, {
      message: 'Drivers retrieved successfully',
      data: rows.map(toDriverResponseDto),
      meta: buildMeta({ page: pagination.page, pageSize: pagination.pageSize, total }),
    });
  };

  listActive = async (req, res) => {
    const drivers = await this.listActiveDriversUseCase.execute();
    return ApiResponse.success(res, {
      message: 'Active drivers retrieved successfully',
      data: drivers.map(toDriverResponseDto),
    });
  };

  update = async (req, res) => {
    const driver = await this.updateDriverUseCase.execute(req.params.id, req.body, req.user.id);
    return ApiResponse.success(res, {
      message: 'Driver updated successfully',
      data: toDriverResponseDto(driver),
    });
  };

  remove = async (req, res) => {
    await this.deleteDriverUseCase.execute(req.params.id, req.user.id);
    return ApiResponse.success(res, { message: 'Driver deleted successfully' });
  };
}

module.exports = DriverController;
