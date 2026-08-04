class CreateCustomerUseCase {
  constructor(customerRepository, logger) {
    this.customerRepository = customerRepository;
    this.logger = logger;
  }

  async execute({ createdBy, ...data }) {
    const customer = await this.customerRepository.create({ ...data, createdBy });
    this.logger.info('Customer created', { customerId: customer.id, createdBy });
    return customer;
  }
}

module.exports = CreateCustomerUseCase;
