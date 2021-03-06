import { Op } from "sequelize";
import {
  Races,
  Results,
  Circuits,
  Sessions,
  Drivers,
  CarConstructor,
  sequelize,
} from "../models/index";
import { pick } from "lodash";

export const getEvent = [
  async (req, res) => {
    const race_id = req.query.race_id;

    let event;
    if (race_id != null) {
      event = await buildEvent(race_id);
    } else {
      event = await getCurrentEvent();
    }
    console.log("Got Event");
    const results = await getRaceResults(event.race_id);
    console.log("Got Results");

    res.json({
      event,
      results,
    });
  },
];

export const getCalendar = [
  async (req, res) => {
    const seasonParam = req.query.season;
    const season = seasonParam != null ? seasonParam : new Date().getFullYear();

    const currentEvent = await getCurrentEvent();

    const races = await Races.findAll({
      where: { year: { [Op.eq]: season } },
    });

    const currentEventIndex = races.findIndex(
      (race) => race.race_id === currentEvent.race_id
    );

    res.json({
      calendar: races,
      currentEventIndex: currentEventIndex != -1 ? currentEventIndex : 0,
    });
  },
];

export const getSeasons = [
  async (req, res) => {
    const [seasons] = await sequelize.query(
      "SELECT DISTINCT year from races order by year DESC"
    );
    res.json(seasons.map((s) => s.year));
  },
];

const getCurrentEvent = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = await Races.findOne({
    where: { datetime: { [Op.gt]: today } },
    order: [["datetime", "ASC"]],
    limit: 1,
  });
  return buildEvent(race.race_id);
};

const getRaceResults = async (race_id) => {
  return Results.findAll({
    where: { race_id: { [Op.eq]: race_id } },
    include: [Drivers, CarConstructor],
  });
};

const buildEvent = async (race_id) => {
  const race = await Races.findOne({
    where: { race_id: { [Op.eq]: race_id } },
    include: [Circuits],
  });
  const sessions = await Sessions.findAll({
    where: { race_id: { [Op.eq]: race_id } },
    order: [["datetime", "ASC"]],
  });
  const schedule = [
    ...sessions,
    { race_id: race.race_id, name: "Gara", datetime: race.datetime },
  ];

  const event = {
    ...pick(race, [
      "race_id",
      "year",
      "round",
      "name",
      "date",
      "time",
      "url",
      "datetime",
      "circuit",
    ]),
    schedule,
  };
  return event;
};
