import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Order "mo:core/Order";

actor {
  type HabitCategory = {
    #sleep;
    #study;
    #exercise;
  };

  type HabitLogEntry = {
    category : HabitCategory;
    quantity : Float;
    date : Int;
    timestamp : Int;
  };

  type DriftStatus = {
    isDrifting : Bool;
    driftMagnitude : Float;
  };

  type CollapseStatus = {
    isCollapsed : Bool;
    consecutiveMissedDays : Nat;
    consecutiveZeroDays : Nat;
  };

  type MomentumStatus = {
    isDecaying : Bool;
    decayRate : Float;
  };

  type ProbabilityPrediction = {
    probabilityScore : Nat;
    riskTier : Text;
  };

  type TimeSeriesForecast = {
    historicalSeries : [(Int, Float)];
    forecastedSeries : [(Int, Float)];
  };

  type HabitCluster = {
    clusterLabel : Text;
    consistencyScore : Float;
    averageValue : Float;
    collapseProbability : Float;
  };

  // Stable storage — survives upgrades
  stable var stableHabitLogs : [(Text, HabitLogEntry)] = [];

  // In-memory map rebuilt from stable storage
  let habitLogs = Map.fromIter<Text, HabitLogEntry>(stableHabitLogs.values());

  // Persist in-memory map back to stable storage before upgrade
  system func preupgrade() {
    stableHabitLogs := habitLogs.entries().toArray();
  };

  func computeAverage(entries : List.List<HabitLogEntry>) : Float {
    var sum = 0.0;
    var count = 0;

    for (entry in entries.values()) {
      sum := sum + entry.quantity;
      count += 1;
    };

    if (count == 0) { return 0.0 };
    sum / count.toFloat();
  };

  func findEntriesByRange(startDay : Time.Time, endDay : Time.Time) : List.List<HabitLogEntry> {
    let filtered = List.empty<HabitLogEntry>();

    for ((_, entry) in habitLogs.entries()) {
      if (entry.date >= startDay and entry.date <= endDay) {
        filtered.add(entry);
      };
    };
    filtered;
  };

  module TimeSeriesForecast {
    public func compare(tsf1 : TimeSeriesForecast, tsf2 : TimeSeriesForecast) : Order.Order {
      Float.compare(tsf1.historicalSeries.size().toFloat(), tsf2.historicalSeries.size().toFloat());
    };
  };

  public shared ({ caller }) func createLog(category : HabitCategory, quantity : Float, date : Int) : async () {
    let logEntry : HabitLogEntry = {
      category;
      quantity;
      date;
      timestamp = Time.now();
    };

    let key = logEntry.timestamp.toText();
    habitLogs.add(key, logEntry);
  };

  public query ({ caller }) func getLogsByCategory(category : HabitCategory) : async [HabitLogEntry] {
    let logs = List.empty<HabitLogEntry>();

    for ((_, entry) in habitLogs.entries()) {
      if (entry.category == category) {
        logs.add(entry);
      };
    };

    logs.toArray();
  };

  public query ({ caller }) func getLogsByDateRange(startDate : Int, endDate : Int) : async [HabitLogEntry] {
    let logs = List.empty<HabitLogEntry>();

    for ((_, entry) in habitLogs.entries()) {
      if (entry.date >= startDate and entry.date <= endDate) {
        logs.add(entry);
      };
    };

    logs.toArray();
  };

  public query ({ caller }) func getAllLogs() : async [HabitLogEntry] {
    habitLogs.values().toArray();
  };
};
