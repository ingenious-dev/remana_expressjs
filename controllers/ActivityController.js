const { Op } = require("sequelize");

const ActivityModel = require("../db/models/Activity");

function activityReadSerializer(item) {
  return {
    id: item.id,
    created_at: new Date(item.created_at).getTime() / 1000,
    category: item.category,
    subject: item.subject,
    agenda_or_body: item.agenda_or_body,
    date_of_activity: item.date_of_activity,
    location: item.location,
    author: item.author,
  }
}

function activityWriteSerializer(req) {
  const {
    body: payload,
  } = req;

  const data = {
    category: payload.category,
    subject: payload.subject,
    agenda_or_body: payload.agenda_or_body,
    date_of_activity: payload.date_of_activity,
    location: payload.location,
  }

  return data
}

module.exports = {
  getAllActivities: (req, res) => {
    const { query } = req;

    const filters = { }

    if(query.start && query.end) {
      filters['date_of_activity'] =  {
        [Op.between]: [query.start, query.end],
      }
    } else if(query.start) {
      filters['date_of_activity'] =  {
        [Op.gte]: query.start,
      }
    } else if(query.end) {
      filters['date_of_activity'] =  {
        [Op.lte]: query.end,
      }
    }
    
    if(query.q) {
      filters['subject'] =  {
        [Op.substring]: query.q,
      }
    }

    ActivityModel.findAllActivities(
      Object.assign(
        filters, {
        author: req.user.id,
      })
    )
      .then((actvities) => {
        // return res.status(200).json(actvities);

        const data = actvities.map(activityReadSerializer)
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: `ERROR FINDING ACTVITIES: ${err.message}`,
        });
      });
  },

  getActivityById: (req, res) => {
    const {
      params: { activity_id },
    } = req;

    ActivityModel.findActivity({ id: activity_id, author: req.user.id })
      .then((activity) => {
        // return res.status(200).json(activity.toJSON());
        
        if(activity) {
          const data = activityReadSerializer(activity)
          return res.status(200).json(data);
        } else {
          return res.status(404).json({
            code: "ERROR_CODE_NOT_FOUND",
            message: "Not Found.",
          });
        }
        
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  createActivity: (req, res) => {
    const { body } = req;

    const data = activityWriteSerializer(req)
    
    ActivityModel.createActivity(
      Object.assign(data, {
        author: req.user.id,
      })
    )
      .then((activity) => {
        // return res.status(200).json(activity.toJSON());

        const data = activityReadSerializer(activity)
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateActivity: (req, res) => {
    const {
      params: { activity_id },
      body: payload,
    } = req;

    // IF the payload does not have any keys,
    // THEN we can return an error, as nothing can be updated
    if (!Object.keys(payload).length) {
      return res.status(400).json({
        code: 'ERROR_CODE_INPUT_ERROR',
        message: "Body is empty, hence can not update the activity.",
      });
    }

    const data = activityWriteSerializer(req)

    ActivityModel.updateActivity({ id: activity_id, author: req.user.id }, data)
      .then((value) => {
        // return ActivityModel.findActivity({ id: activity_id });

        const numberOfEntriesUpdated = value[0];
        if(numberOfEntriesUpdated) {
          return ActivityModel.findActivity({ id: activity_id });
        } else {
          return res.status(404).json({
            code: "ERROR_CODE_NOT_FOUND",
            message: "Not Found.",
          });
        }
        
      })
      .then((activity) => {
        // return res.status(200).json(activity.toJSON());

        const data = activityReadSerializer(activity)
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  deleteActivity: (req, res) => {
    const {
      params: { activity_id },
    } = req;

    ActivityModel.deleteActivity({ id: activity_id, author: req.user.id })
      .then((numberOfEntriesDeleted) => {
        // return res.status(200).json({
        //   status: true,
        //   data: {
        //     numberOfActivitiesDeleted: numberOfEntriesDeleted
        //   },
        // });

        if(numberOfEntriesDeleted) {
          return res.status(204).json(null);
        } else {
          return res.status(404).json({
            code: "ERROR_CODE_ACCESS_DENIED",
            message: "Permission Denied.",
          });
        }
        
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
