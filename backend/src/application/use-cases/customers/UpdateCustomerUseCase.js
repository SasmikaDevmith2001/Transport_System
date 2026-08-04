const { NotFoundError } = require('../../../domain/errors');

class UpdateCustomerUseCase {
  constructor(customerRepository, logger) {
    this.customerRepository = customerRepository;
    this.logger = logger;
  }

  async execute(id, updates, updatedBy) {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    const customer = await this.customerRepository.update(id, { ...updates, updatedBy });
    this.logger.info('Customer updated', { customerId: id, updatedBy });
    return customer;
  }
}

module.exports = UpdateCustomerUseCase;
