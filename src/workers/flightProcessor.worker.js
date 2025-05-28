// 完全保持原有数据处理逻辑，仅在Worker中执行
class FlightProcessor {
    constructor() {
        this.previousPositions = new Map();
    }

    processFlights(flightData) {
        const updates = [];
        const currentFlights = new Set();

        flightData.forEach(flight => {
            if (!flight || flight.length < 7) return;

            const icao24 = flight[0];
            currentFlights.add(icao24);

            const prevPosition = this.previousPositions.get(icao24);
            const longitude = flight[5];
            const latitude = flight[6];
            const altitude = flight[7] || 0;

            updates.push({
                icao24,
                flight,
                prevPosition: prevPosition || { longitude, latitude, altitude }
            });

            this.previousPositions.set(icao24, { longitude, latitude, altitude });
        });

        // 清理不再存在的航班
        this.previousPositions.forEach((_, icao24) => {
            if (!currentFlights.has(icao24)) {
                this.previousPositions.delete(icao24);
            }
        });

        return updates;
    }
}

const processor = new FlightProcessor();

self.onmessage = function(e) {
    if (e.data.type === 'PROCESS_FLIGHTS') {
        const updates = processor.processFlights(e.data.flightData);
        self.postMessage({
            type: 'UPDATE_ENTITIES',
            data: updates
        });
    }
};
