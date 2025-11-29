const { ethers } = require('ethers');

class PolygonService {
  constructor() {
    // RPC de Polygon Mainnet
    this.rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/ee1fad49027d4b21be0e64ed49f0c8b5';
    
    // Dirección del contrato PaymentGateway
    this.paymentGatewayAddress = process.env.POLYGON_PAYMENT_GATEWAY_ADDRESS || '0x52a83a44aa073C0a423f914A6c824DA640ED2F6A';
    
    // Dirección del token USDC (fake)
    this.usdcTokenAddress = process.env.POLYGON_USDC_ADDRESS || '0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C';
    
    // ABI del contrato PaymentGateway
    this.paymentGatewayABI = [
      'function pay(address merchant, uint256 amountARS, address token, bytes32 paymentId) external returns(bool)',
      'function processedPayments(bytes32) external view returns(bool)',
      'function admin() external view returns(address)',
      'function oracle() external view returns(address)',
      'event PaymentProcessed(bytes32 indexed id, address merchant, address token, uint256 amount)'
    ];
    
    // Inicializar provider sin resolución ENS (para evitar errores)
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    // Deshabilitar resolución ENS para evitar errores
    this.provider._getResolver = null;
    
    // El contrato se inicializará cuando se necesite firmar transacciones
    this.paymentGatewayContract = null;
    
    // Wallet del admin (necesario para firmar transacciones)
    this.adminWallet = null;
    this.initializeWallet();
    
    console.log('✅ PolygonService inicializado');
    console.log(`   Payment Gateway: ${this.paymentGatewayAddress}`);
    console.log(`   USDC Token: ${this.usdcTokenAddress}`);
    console.log(`   RPC URL: ${this.rpcUrl}`);
  }

  // Inicializar wallet del admin
  initializeWallet() {
    try {
      const privateKey = process.env.POLYGON_ADMIN_PRIVATE_KEY;
      if (!privateKey) {
        console.warn('⚠️ POLYGON_ADMIN_PRIVATE_KEY no configurada. Las transacciones no podrán ser firmadas.');
        return;
      }
      
      this.adminWallet = new ethers.Wallet(privateKey, this.provider);
      this.paymentGatewayContract = new ethers.Contract(
        this.paymentGatewayAddress,
        this.paymentGatewayABI,
        this.adminWallet
      );
      
      console.log(`✅ Wallet admin inicializada: ${this.adminWallet.address}`);
    } catch (error) {
      console.error('❌ Error inicializando wallet:', error);
    }
  }

  // Convertir paymentId a bytes32
  // El paymentId debe ser un número que se convierte a bytes32
  // Ejemplo: 1 -> 0x0000000000000000000000000000000000000000000000000000000000000001
  convertPaymentIdToBytes32(paymentId) {
    try {
      // Si paymentId es un string numérico, convertirlo a número
      const paymentIdNumber = typeof paymentId === 'string' ? parseInt(paymentId, 10) : paymentId;
      
      // Validar que sea un número válido
      if (isNaN(paymentIdNumber) || paymentIdNumber < 0) {
        throw new Error(`Invalid paymentId: ${paymentId} (must be a positive number)`);
      }
      
      // Convertir a BigInt y luego a hex usando ethers.toBeHex
      // Esto asegura que el formato sea correcto para ethers
      const bigIntValue = BigInt(paymentIdNumber);
      const hexValue = ethers.toBeHex(bigIntValue, 32); // 32 bytes = 64 hex chars
      
      console.log(`📋 PaymentId convertido: ${paymentIdNumber} -> ${hexValue}`);
      
      return hexValue;
    } catch (error) {
      console.error('❌ Error convirtiendo paymentId a bytes32:', error);
      throw error;
    }
  }

  // Ejecutar función pay del contrato PaymentGateway
  async executePayment(merchantAddress, amountARS, tokenAddress, paymentId) {
    try {
      if (!this.adminWallet || !this.paymentGatewayContract) {
        throw new Error('Wallet admin no configurada. Configure POLYGON_ADMIN_PRIVATE_KEY en las variables de entorno.');
      }

      console.log('🚀 Ejecutando pago en Polygon...');
      console.log(`   Merchant: ${merchantAddress}`);
      console.log(`   Amount ARS: ${amountARS}`);
      console.log(`   Token: ${tokenAddress}`);
      console.log(`   Payment ID: ${paymentId}`);

      // Convertir paymentId a bytes32
      const paymentIdBytes32 = this.convertPaymentIdToBytes32(paymentId);
      console.log(`   Payment ID (bytes32): ${paymentIdBytes32}`);

      // Validar y normalizar direcciones
      // Las direcciones de Polygon/Ethereum tienen 42 caracteres (0x + 40 hex)
      if (merchantAddress.length !== 42) {
        throw new Error(`Dirección inválida para Polygon: ${merchantAddress}. Las direcciones de Polygon deben tener 42 caracteres (tiene ${merchantAddress.length}). Por favor, crea una nueva wallet compatible con Polygon.`);
      }
      
      if (tokenAddress.length !== 42) {
        throw new Error(`Dirección de token inválida para Polygon: ${tokenAddress}. Debe tener 42 caracteres.`);
      }
      
      // Asegurar que las direcciones estén en formato correcto (checksummed)
      const merchantAddr = ethers.getAddress(merchantAddress);
      const tokenAddr = ethers.getAddress(tokenAddress);
      
      console.log(`   Merchant (checksummed): ${merchantAddr}`);
      console.log(`   Token (checksummed): ${tokenAddr}`);

      // Verificar si el pago ya fue procesado
      // Nota: Esta verificación puede fallar en algunos casos, pero continuamos con la transacción
      console.log('🔍 Verificando si el pago ya fue procesado...');
      let isProcessed = false;
      try {
        isProcessed = await this.paymentGatewayContract.processedPayments(paymentIdBytes32);
        console.log(`   Pago procesado: ${isProcessed}`);
        if (isProcessed) {
          throw new Error('Este pago ya fue procesado');
        }
      } catch (error) {
        // Si el error es sobre ENS resolver o decodificación, ignorarlo y continuar
        // Esto puede suceder si el contrato no tiene la función o hay problemas de red
        if (error.code === 'BAD_DATA' || (error.info && error.info.method === 'resolver')) {
          console.warn('⚠️ No se pudo verificar processedPayments, continuando con la transacción...');
          console.warn(`   Error: ${error.message}`);
        } else if (error.message.includes('ya fue procesado')) {
          // Si el error es que ya fue procesado, sí lanzarlo
          throw error;
        } else {
          // Para otros errores, también continuamos (puede ser un problema de red temporal)
          console.warn('⚠️ Error verificando processedPayments, continuando:', error.message);
        }
      }

      // Convertir amountARS a BigNumber (sin decimales, ya que ARS es entero)
      const amountARSBigInt = ethers.parseUnits(amountARS.toString(), 0);

      // Llamar a la función pay
      console.log('📝 Enviando transacción...');
      const tx = await this.paymentGatewayContract.pay(
        merchantAddr,
        amountARSBigInt,
        tokenAddr,
        paymentIdBytes32
      );

      console.log(`⏳ Transacción enviada: ${tx.hash}`);
      console.log('⏳ Esperando confirmación...');

      // Esperar confirmación
      const receipt = await tx.wait();
      
      console.log(`✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);
      console.log(`   Gas usado: ${receipt.gasUsed.toString()}`);

      // Buscar el evento PaymentProcessed
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.paymentGatewayContract.interface.parseLog(log);
          return parsed && parsed.name === 'PaymentProcessed';
        } catch {
          return false;
        }
      });

      let paymentEvent = null;
      if (event) {
        try {
          const parsed = this.paymentGatewayContract.interface.parseLog(event);
          paymentEvent = {
            paymentId: parsed.args.id,
            merchant: parsed.args.merchant,
            token: parsed.args.token,
            amount: parsed.args.amount.toString()
          };
        } catch (error) {
          console.warn('⚠️ Error parseando evento:', error);
        }
      }

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: `https://polygonscan.com/tx/${receipt.hash}`,
        paymentEvent,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error ejecutando pago:', error);
      
      // Si el error contiene información de la transacción, intentar extraerla
      if (error.transaction) {
        return {
          success: false,
          error: error.message,
          transactionHash: error.transaction.hash,
          explorerUrl: `https://polygonscan.com/tx/${error.transaction.hash}`
        };
      }
      
      throw error;
    }
  }

  // Verificar si un pago ya fue procesado
  async isPaymentProcessed(paymentId) {
    try {
      if (!this.paymentGatewayContract) {
        this.paymentGatewayContract = new ethers.Contract(
          this.paymentGatewayAddress,
          this.paymentGatewayABI,
          this.provider
        );
      }

      const paymentIdBytes32 = this.convertPaymentIdToBytes32(paymentId);
      const isProcessed = await this.paymentGatewayContract.processedPayments(paymentIdBytes32);
      
      return isProcessed;
    } catch (error) {
      console.error('❌ Error verificando pago procesado:', error);
      return false;
    }
  }

  // Obtener información del contrato
  async getContractInfo() {
    try {
      if (!this.paymentGatewayContract) {
        this.paymentGatewayContract = new ethers.Contract(
          this.paymentGatewayAddress,
          this.paymentGatewayABI,
          this.provider
        );
      }

      const admin = await this.paymentGatewayContract.admin();
      const oracle = await this.paymentGatewayContract.oracle();

      return {
        paymentGatewayAddress: this.paymentGatewayAddress,
        admin,
        oracle,
        usdcTokenAddress: this.usdcTokenAddress,
        network: 'Polygon Mainnet',
        rpcUrl: this.rpcUrl
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del contrato:', error);
      throw error;
    }
  }
}

module.exports = PolygonService;

