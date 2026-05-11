const Agent = require('../models/agent.model');

const checkAreaAccess = async (req, res, next) => {
  try {
    /*
    -------------------------------------------------------------------------
    ADMIN / OPERATOR FULL ACCESS
    -------------------------------------------------------------------------
    */

    if (req.user.role === 'admin' || req.user.role === 'operator') {
      return next();
    }

    /*
    -------------------------------------------------------------------------
    AGENT ACCESS VALIDATION
    -------------------------------------------------------------------------
    */

    const agent = await Agent.findById(req.user.id);

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      });
    }

    const requestedAreaId =
      req.params.areaId || req.body.areaId || req.query.areaId;

    if (!requestedAreaId) {
      return res.status(400).json({
        message: 'Area ID missing',
      });
    }

    const hasAccess = agent.assignedAreas.some(
      (area) => area.toString() === requestedAreaId.toString(),
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: 'No access to this area',
      });
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Area access validation failed',
    });
  }
};

module.exports = checkAreaAccess;
