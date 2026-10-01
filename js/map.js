(function () {
    var list = document.getElementById('guides-list');
    var title = document.getElementById('guides-title');

    if (list && title) {
        var all = Array.prototype.slice.call(list.querySelectorAll('.tile'));

        function select(gis) {
            title.textContent = gis ? 'Аудиогиды маршрута' : 'Все аудиогиды';
            all.forEach(function (tile) {
                tile.hidden = !!gis && tile.dataset.gis !== gis;
            });
        }

        document.querySelectorAll('.gis-mock-route').forEach(function (btn) {
            btn.addEventListener('click', function () {
                select(btn.dataset.gis || '');
            });
        });
    }

    /*
     * ИНТЕРАКТИВНАЯ КАРТА
     *
     * Все точки загружаются из ../data/POINTS-PERM_geojson.geojson.
     * Чтобы заменить точки, достаточно заменить GeoJSON-файл.
     * Координаты в GeoJSON имеют стандартный порядок [долгота, широта].
     */
    var mapElement = document.getElementById('interactive-map');
    if (!mapElement || typeof L === 'undefined') return;

    var map = L.map('interactive-map', {
        zoomControl: true,
        scrollWheelZoom: true,
        wheelDebounceTime: 80,
        wheelPxPerZoomLevel: 180,
        zoomDelta: 0.5,
        zoomSnap: 0.5,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 10,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    var bounds = L.latLngBounds([]);

    function createMarkerIcon(number) {
        return L.divIcon({
            className: 'project-marker-wrap',
            html: '<span class="project-marker">' + number + '</span>',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -19]
        });
    }

    function createPopup(feature, number) {
        var properties = feature.properties || {};
        var name = properties.name || 'Объект';
        var description = properties.description || 'Описание объекта будет добавлено позже.';
        var guide = properties.guide || '';

        var popup = '<div class="map-popup">' +
            '<div class="map-popup__number">Точка ' + number + '</div>' +
            '<h3>' + escapeHtml(name) + '</h3>' +
            '<p>' + escapeHtml(description) + '</p>';

        if (guide) {
            popup += '<a class="map-popup__link" href="' + escapeHtml(guide) + '">Открыть аудиогид</a>';
        }

        popup += '</div>';
        return popup;
    }

    fetch('../data/POINTS-PERM_geojson.geojson')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Не удалось загрузить GeoJSON: ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            var features = Array.isArray(data.features) ? data.features : [];

            if (!features.length) {
                throw new Error('В GeoJSON нет точечных объектов.');
            }

            features.forEach(function (feature, index) {
                var geometry = feature.geometry || {};
                if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
                    return;
                }

                var coordinates = geometry.coordinates;
                if (coordinates.length < 2) return;

                // GeoJSON: [долгота, широта] -> Leaflet: [широта, долгота]
                var latLng = [coordinates[1], coordinates[0]];
                bounds.extend(latLng);

                L.marker(latLng, {
                    icon: createMarkerIcon(index + 1)
                })
                    .addTo(map)
                    .bindPopup(createPopup(feature, index + 1), {
                        maxWidth: 320,
                        minWidth: 220,
                        className: 'project-popup',
                        closeButton: true,
                        autoPan: true,
                        autoPanPaddingTopLeft: [24, 24],
                        autoPanPaddingBottomRight: [24, 24]
                    });
            });

            if (bounds.isValid()) {
                map.fitBounds(bounds, {
                    padding: [45, 45],
                    maxZoom: 14,
                    animate: false
                });
            }

            window.setTimeout(function () {
                map.invalidateSize({ pan: false });
                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [45, 45],
                        maxZoom: 14,
                        animate: false
                    });
                }
            }, 100);
        })
        .catch(function (error) {
            console.error(error);
            mapElement.classList.add('interactive-map--error');
            mapElement.insertAdjacentHTML(
                'beforeend',
                '<div class="interactive-map__error">Не удалось загрузить точки карты. Проверьте наличие файла GeoJSON.</div>'
            );
        });

    window.addEventListener('resize', function () {
        map.invalidateSize({ pan: false });
    });

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
