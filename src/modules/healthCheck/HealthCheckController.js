class HealthCheckController {
  static welcome(req, res) {
    res.status(200)
      .json({
        message: 'Welcome to Travel Tool',
      });
  }
}

export default HealthCheckController;
