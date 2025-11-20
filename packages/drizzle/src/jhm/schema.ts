import {
  pgTable,
  text,
  varchar,
  date,
  numeric,
  integer,
  check,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Base tables - no foreign keys

export const jhmCountry = pgTable(
  "jhm_country",
  {
    countryId: varchar("country_id").primaryKey(),
    isoCode: numeric("iso_code").notNull(),
    countryName: varchar("country_name").notNull(),
  },
  (table) => ({
    isoCodeCheck: check(
      "iso_code_check",
      sql`${table.isoCode} > 0 AND ${table.isoCode} < 1000`
    ),
  })
);

export const jhmLanguage = pgTable("jhm_language", {
  languageId: varchar("language_id").primaryKey(),
  langCode: varchar("lang_code").notNull(),
  langName: varchar("lang_name").notNull(),
});

export const jhmSeriesType = pgTable("jhm_series_type", {
  typeId: varchar("type_id").primaryKey(),
  typeCode: varchar("type_code").notNull(),
  typeName: varchar("type_name").notNull(),
});

// Second level tables

export const jhmProdHouse = pgTable(
  "jhm_prod_house",
  {
    houseId: varchar("house_id").primaryKey(),
    houseName: varchar("house_name").notNull(),
    yearEstab: date("year_estab").notNull(),
    streetAddr: varchar("street_addr").notNull(),
    city: varchar("city").notNull(),
    state: varchar("state").notNull(),
    zipCode: numeric("zip_code").notNull(),
    countryId: varchar("country_id")
      .notNull()
      .references(() => jhmCountry.countryId),
  },
  (table) => ({
    yearEstabCheck: check(
      "year_estab_check",
      sql`${table.yearEstab} >= '1900-01-01' AND ${table.yearEstab} <= CURRENT_DATE`
    ),
  })
);

export const jhmProducer = pgTable(
  "jhm_producer",
  {
    producerId: varchar("producer_id").primaryKey(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    phoneNo: varchar("phone_no").notNull(),
    emailAddr: varchar("email_addr").notNull(),
    streetAddr: varchar("street_addr").notNull(),
    city: varchar("city").notNull(),
    state: varchar("state").notNull(),
    zipCode: numeric("zip_code").notNull(),
    countryId: varchar("country_id")
      .notNull()
      .references(() => jhmCountry.countryId),
  },
  (table) => ({
    emailCheck: check("email_check", sql`${table.emailAddr} LIKE '%@%'`),
  })
);

export const jhmViewerAct = pgTable(
  "jhm_viewer_act",
  {
    viewerId: varchar("viewer_id").primaryKey(),
    accountId: varchar("account_id").notNull(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    streetAddr: varchar("street_addr").notNull(),
    city: varchar("city").notNull(),
    state: varchar("state").notNull(),
    zipCode: integer("zip_code").notNull(),
    openDate: date("open_date").notNull(),
    emailAddr: varchar("email_addr").notNull(),
    monthlyFee: integer("monthly_fee").notNull(),
    countryId: varchar("country_id")
      .notNull()
      .references(() => jhmCountry.countryId),
  },
  (table) => ({
    zipCodeCheck: check("zip_code_check", sql`${table.zipCode} > 0`),
    emailCheck: check("email_check", sql`${table.emailAddr} LIKE '%@%'`),
    monthlyFeeCheck: check("monthly_fee_check", sql`${table.monthlyFee} >= 0`),
  })
);

export const jhmWebSeries = pgTable(
  "jhm_web_series",
  {
    seriesId: varchar("series_id").primaryKey(),
    seriesName: varchar("series_name").notNull(),
    releaseDate: date("release_date"),
    episodeCnt: integer("episode_cnt"),
    typeId: varchar("type_id")
      .notNull()
      .references(() => jhmSeriesType.typeId),
    countryId: varchar("country_id")
      .notNull()
      .references(() => jhmCountry.countryId),
  },
  (table) => ({
    episodeCntCheck: check("episode_cnt_check", sql`${table.episodeCnt} > 0`),
  })
);

// Third level tables

export const jhmHouseProducer = pgTable("jhm_house_producer", {
  houseProdId: varchar("house_prod_id").primaryKey(),
  assocStart: date("assoc_start").notNull(),
  assocEnd: date("assoc_end").notNull(),
  producerId: varchar("producer_id")
    .notNull()
    .references(() => jhmProducer.producerId),
  houseId: varchar("house_id")
    .notNull()
    .references(() => jhmProdHouse.houseId),
});

export const jhmEpisode = pgTable(
  "jhm_episode",
  {
    episodeId: varchar("episode_id").primaryKey(),
    epNumber: numeric("ep_number").notNull(),
    epTitle: varchar("ep_title").notNull(),
    plannedStart: date("planned_start"),
    plannedEnd: date("planned_end"),
    viewersCount: numeric("viewers_count"),
    seriesId: varchar("series_id")
      .notNull()
      .references(() => jhmWebSeries.seriesId),
  },
  (table) => ({
    viewersCountCheck: check(
      "viewers_count_check",
      sql`${table.viewersCount} >= 0`
    ),
  })
);

export const jhmContract = pgTable(
  "jhm_contract",
  {
    contractId: varchar("contract_id").primaryKey(),
    contractYear: date("contract_year").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    perEpFee: numeric("per_ep_fee").notNull(),
    statusCode: varchar("status_code").notNull(),
    seriesId: varchar("series_id")
      .notNull()
      .references(() => jhmWebSeries.seriesId),
    houseId: varchar("house_id")
      .notNull()
      .references(() => jhmProdHouse.houseId),
    isRenewed: varchar("is_renewed").notNull(),
    prevContId: varchar("prev_cont_id"),
  },
  (table) => ({
    perEpFeeCheck: check("per_ep_fee_check", sql`${table.perEpFee} > 0`),
  })
);

export const jhmWsDubbing = pgTable("jhm_ws_dubbing", {
  wsDubbingId: varchar("ws_dubbing_id").primaryKey(),
  languageId: varchar("language_id")
    .notNull()
    .references(() => jhmLanguage.languageId),
  seriesId: varchar("series_id")
    .notNull()
    .references(() => jhmWebSeries.seriesId),
});

export const jhmWsSubtitle = pgTable("jhm_ws_subtitle", {
  wsSubtitleId: varchar("ws_subtitle_id").primaryKey(),
  languageId: varchar("language_id")
    .notNull()
    .references(() => jhmLanguage.languageId),
  seriesId: varchar("series_id")
    .notNull()
    .references(() => jhmWebSeries.seriesId),
});

export const jhmWsRelease = pgTable("jhm_ws_release", {
  wsRelId: varchar("ws_rel_id").primaryKey(),
  releaseDate: date("release_date").notNull(),
  seriesId: varchar("series_id")
    .notNull()
    .references(() => jhmWebSeries.seriesId),
  countryId: varchar("country_id")
    .notNull()
    .references(() => jhmCountry.countryId),
});

export const jhmFeedback = pgTable(
  "jhm_feedback",
  {
    feedbackId: varchar("feedback_id").primaryKey(),
    rating: numeric("rating").notNull(),
    feedbackTxt: varchar("feedback_txt").notNull(),
    feedbackDate: date("feedback_date").notNull(),
    seriesId: varchar("series_id")
      .notNull()
      .references(() => jhmWebSeries.seriesId),
    viewerId: varchar("viewer_id")
      .notNull()
      .references(() => jhmViewerAct.viewerId),
  },
  (table) => ({
    ratingCheck: check(
      "rating_check",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`
    ),
  })
);

// Fourth level tables

export const jhmEpiSched = pgTable("jhm_epi_sched", {
  schedAudId: varchar("sched_aud_id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  technicalInte: varchar("technical_inte").notNull(),
  episodeId: varchar("episode_id")
    .notNull()
    .references(() => jhmEpisode.episodeId),
});
