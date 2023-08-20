import React, { useEffect, useState } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftMaintenanceFormInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IMaintenance {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftMaintenanceFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Maintenance: React.FC<IMaintenance> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      mtxTracking: values.mtxTracking,
      airframeProgram: values.airframeProgram,
      engineProgram: values.engineProgram,
      apuProgram: values.apuProgram,
      avionicsProgram: values.avionicsProgram,
      mtxCondition: values.mtxCondition,
      annualDue: values.annualDue,
      cCheckDue: values.cCheckDue,
      lGearOhDue: values.lGearOhDue,
      inspectionStatus: values.inspectionStatus,
      warrantyAfYr: values.warrantyAfYr,
      warrantyEngYr: values.warrantyEngYr,
      warrantyAviYr: values.warrantyAviYr,
      warrantyApuYr: values.warrantyApuYr,
      warrantyPropYr: values.warrantyPropYr,
      lastPerformed: values.lastPerformed,
      nextDue: values.nextDue,
      warrantyAfHrs: values.warrantyAfHrs,
      warrantyEngHrs: values.warrantyEngHrs,
      warrantyPropHrs: values.warrantyPropHrs,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.maintenance) {
      const {
        mtxTracking,
        airframeProgram,
        engineProgram,
        apuProgram,
        avionicsProgram,
        mtxCondition,
        annualDue,
        cCheckDue,
        lGearOhDue,
        inspectionStatus,
        lastPerformed,
        nextDue,
        warrantyAfYr,
        warrantyEngYr,
        warrantyEngHrs,
        warrantyAviYr,
        warrantyApuYr,
        warrantyPropYr,
        warrantyPropHrs,
        warrantyAfHrs,
      } = currentAd.maintenance

      onInitialValues(prev => ({
        ...prev,
        mtxTracking: mtxTracking ? mtxTracking.value.toString() : '',
        airframeProgram: airframeProgram ? airframeProgram.value.toString() : '',
        engineProgram: engineProgram ? engineProgram.value.toString() : '',
        apuProgram: apuProgram ? apuProgram.value.toString() : '',
        avionicsProgram: avionicsProgram ? avionicsProgram.value.toString() : '',
        mtxCondition: mtxCondition ? mtxCondition.value.toString() : '',
        annualDue: annualDue ? annualDue.value.toString() : '',
        cCheckDue: cCheckDue ? cCheckDue.value.toString() : '',
        lGearOhDue: lGearOhDue ? lGearOhDue.value.toString() : '',
        inspectionStatus: inspectionStatus ? inspectionStatus.value.toString() : '',
        lastPerformed: lastPerformed ? lastPerformed : '',
        nextDue: nextDue ? nextDue : '',
        warrantyAfYr: warrantyAfYr ? warrantyAfYr.value.toString() : '',
        warrantyEngYr: warrantyEngYr ? warrantyEngYr.value.toString() : '',
        warrantyAfHrs: warrantyAfHrs ? warrantyAfHrs : '',
        warrantyEngHrs: warrantyEngHrs ? warrantyEngHrs : '',
        warrantyAviYr: warrantyAviYr ? warrantyAviYr.value.toString() : '',
        warrantyApuYr: warrantyApuYr ? warrantyApuYr.value.toString() : '',
        warrantyPropYr: warrantyPropYr ? warrantyPropYr.value.toString() : '',
        warrantyPROPHrs: warrantyPropHrs ? warrantyPropHrs : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">Maintenance</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items" title="">
          <div className="accordion__item">
            <FormikSelect
              className="select select-white"
              name="mtxTracking"
              options={choices?.mtxTracking}
              label="MTX Tracking"
              placeholder="Select MTX Tracking"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Airframe Program">
            <FormikSelect
              className="select select-white"
              name="airframeProgram"
              options={choices?.airframeProgram}
              label="Airframe Program"
              placeholder="Select Airframe Program"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Engine Program">
            <FormikSelect
              className="select select-white"
              name="engineProgram"
              options={choices?.engineProgram}
              label="Engine Program"
              placeholder="Select Engine Program"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Program">
            <FormikSelect
              className="select select-white"
              name="apuProgram"
              options={choices?.apuProgram}
              label="APU Program"
              placeholder="Select APU Program"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Avionics Program">
            <FormikSelect
              className="select select-white"
              name="avionicsProgram"
              options={choices?.avionicsProgram}
              label="Avionics Program"
              placeholder="Select Avionics Program"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="">
            <FormikSelect
              className="select select-white"
              name="mtxCondition"
              options={choices?.mtxCondition}
              label="MTX Condition"
              placeholder="Select MTX Condition"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Annual Due">
            <FormikSelect
              className="select select-white"
              name="annualDue"
              options={choices?.annualDue}
              label="Annual Due"
              placeholder="Select Annual Due"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="C Check Due">
            <FormikSelect
              className="select select-white"
              name="cCheckDue"
              options={choices?.cCheckDue}
              label="C Check Due"
              placeholder="Select C Check Due"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="L/Gear Overhaul Due">
            <FormikSelect
              className="select select-white"
              name="lGearOhDue"
              options={choices?.lGearOhDue}
              label="L/Gear OH Due"
              placeholder="Select L/Gear OH Due"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Inspection Status">
            <FormikSelect
              className="select select-white"
              name="inspectionStatus"
              options={choices?.inspectionStatus}
              label="Inspection Status"
              placeholder="Select Inspection Status"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Last Performed">
            <FormikField name="lastPerformed" label="Last Performed" placeholder="Enter Last Performed" />
          </div>
          <div className="accordion__item">
            <FormikField name="nextDue" label="Next Due" placeholder="Enter Next Due" />
          </div>
          <div className="accordion__item" title="Warranty Airframe (Year)">
            <FormikSelect
              className="select select-white"
              name="warrantyAfYr"
              options={choices?.warrantyAfYr}
              label="Warranty AF Yr"
              placeholder="Select Warranty AF Yr"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Warranty Airframe (Hours)">
            <FormikField name="warrantyAfHrs" label="Warranty AF Hrs" placeholder="Enter Warranty AF Hrs" />
          </div>
          <div className="accordion__item">
            <FormikSelect
              className="select select-white"
              name="warrantyEngYr"
              options={choices?.warrantyEngYr}
              label="Warranty ENG Yr"
              placeholder="Select Warranty ENG Yr"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Warranty Engine (Hours)">
            <FormikField name="warrantyEngHrs" label="Warranty ENG Hrs" placeholder="Enter Warranty ENG Hrs" />
          </div>
          <div className="accordion__item" title="Warranty Avionics (Year)">
            <FormikSelect
              className="select select-white"
              name="warrantyAviYr"
              options={choices?.warrantyAviYrType}
              label="Warranty AVI Yr"
              placeholder="Select Warranty AVI Yr"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Warranty Auxiliary Power Unit (Year)">
            <FormikSelect
              className="select select-white"
              name="warrantyApuYr"
              options={choices?.warrantyApuYr}
              label="Warranty APU Yr"
              placeholder="Select Warranty APU Yr"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Warranty Propeller (Year)">
            <FormikSelect
              className="select select-white"
              name="warrantyPropYr"
              options={choices?.warrantyPropYr}
              label="Warranty PROP Yr"
              placeholder="Select Warranty PROP Yr"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Warranty Propeller (Hours)">
            <FormikField name="warrantyPropHrs" label="Warranty PROP Hrs" placeholder="Enter Warranty PROP Hrs" />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Maintenance
