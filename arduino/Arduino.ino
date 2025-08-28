#include <DHT.h>  // Biblioteca para DHT11

#define HIGROMETRO A0     // Pino do sensor de umidade do solo
#define DHTPIN 5          // Pino do DHT11
#define DHTTYPE DHT11     // Tipo do sensor
#define RELE 7            // Pino do relé

DHT dht(DHTPIN, DHTTYPE); // Inicializa o DHT

// Variáveis para armazenar os valores anteriores
int umidadeSoloAnt = -1;
float umidadeArAnt = -1.0;
float temperaturaAnt = -1.0;

void setup() {
  Serial.begin(115200);
  dht.begin();            // Inicia o DHT11
  pinMode(RELE, OUTPUT);  // Configura o relé como saída
  digitalWrite(RELE, HIGH); // Relé desligado inicialmente (ajuste LOW/HIGH conforme módulo)
}

void loop() {
  // Leitura do sensor de umidade do solo
  int leitura = analogRead(HIGROMETRO); // Valor de 0 a 1023
  int umidadePercentual = map(leitura, 1023, 300, 0, 100); // 1023 = seco, 300 = muito úmido
  umidadePercentual = constrain(umidadePercentual, 0, 100);

  // Leitura do DHT11
  float umidadeAr = dht.readHumidity();
  float temperatura = dht.readTemperature();

  // Verifica se os valores mudaram e exibe apenas se houver diferença
  if (umidadePercentual != umidadeSoloAnt) {
    Serial.print("Umidade do solo: ");
    Serial.print(umidadePercentual);
    Serial.println("%");
    umidadeSoloAnt = umidadePercentual;
  }

  if (!isnan(umidadeAr) && !isnan(temperatura) && (umidadeAr != umidadeArAnt || temperatura != temperaturaAnt)) {
    Serial.print("Umidade do ar: ");
    Serial.print(umidadeAr);
    Serial.println("%");
    Serial.print("Temperatura: ");
    Serial.print(temperatura);
    Serial.println("°C");
    umidadeArAnt = umidadeAr;
    temperaturaAnt = temperatura;
  } else if (isnan(umidadeAr) || isnan(temperatura)) {
    Serial.println("Erro ao ler o DHT11!");
  }

  // Check for incoming serial commands
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // Remove any whitespace

    if (command == "RELAY_ON") {
      digitalWrite(RELE, LOW); // Turn relay ON (LOW for active-low)
      Serial.println("Relay ON");
    } else if (command == "RELAY_OFF") {
      digitalWrite(RELE, HIGH); // Turn relay OFF (HIGH for active-low)
      Serial.println("Relay OFF");
    }
  }

  delay(2000);  // Intervalo de 2 segundos entre leituras
}